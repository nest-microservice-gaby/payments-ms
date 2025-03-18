import { envs } from 'src/config/envs';
import { Stripe } from 'stripe';
import { Injectable } from '@nestjs/common';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe(
        envs.stripeSecret,
    )

    async createPaymentSession(paymentSessionDto: PaymentSessionDto) {

        const { currency, items, orderId } = paymentSessionDto;

        const lineItems = items.map(item => {
            return {
                price_data: {
                    currency,
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.quantity,
            }
        });

        console.log('lineItems', lineItems);

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            payment_intent_data: {
                metadata: {
                    orderId,
                }
            },
            line_items: lineItems,
            mode: 'payment',
            success_url: 'http://localhost:3003/payments/success',
            cancel_url: 'http://localhost:3003/payments/cancel',
        });
        return session;
    }

    async stripeWebhook(req: Request, res: Response) {
        const sig = req.headers['stripe-signature']!;
        console.log('sig', sig);
    
        let event: Stripe.Event;
    
        // Real
        const endpointSecret =envs.stripeEndpointSecret;
    
        try {
          event = this.stripe.webhooks.constructEvent(
            req['rawBody'],
            sig,
            endpointSecret,
          );

        } catch (err) {
          res.status(400).send(`Webhook Error: ${err.message}`);
          return;
        }
        
        switch( event.type ) {
          case 'charge.succeeded': 
            const chargeSucceeded = event.data.object;
            // TODO: llamar nuestro microservicio
            console.log({
              metadata: chargeSucceeded.metadata,
              orderId: chargeSucceeded.metadata.orderId,
            });
          break;
          
          default:
            console.log(`Event ${ event.type } not handled`);
        }
    
        return res.status(200).json({ sig });
      }

}
