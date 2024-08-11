import React from "react";
import { env } from "~/env";

export default function TermsOfServicePage() {
  return (
    <div>
      <div className="flex flex-col gap-12 p-10">
        <div className="translate-y-5 text-neutral-700">
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          <h2 className="text-lg font-normal text-neutral-400">
            Last updated: August, 2024
          </h2>
          <p className="my-4">
            Welcome to Profitbook! By accessing or using our application and its
            services, you agree to be bound by the following terms and
            conditions (&ldquo;Terms&rdquo;). If you do not agree to all the
            terms and conditions of this agreement, then you may not access the
            application or use any services.
          </p>
          <div className="px-6 py-2">
            <ol>
              1. Description of Service
              <li className="px-4 py-2">
                Profitbook provides a digital trading journal, including
                charting data of the stock market, for personal analysis and
                reflection on trading strategies. The services offered are
                intended for educational and informational purposes only.
              </li>
            </ol>
            <ol>
              2. No Investment Advice
              <li className="px-4 py-2">
                The data and information provided by Profitbook are for personal
                use only and should not be considered as financial or investment
                advice. We do not offer brokerage services, and our platform is
                not intended for buying or selling securities.
              </li>
            </ol>
            <ol>
              3. Personal Use Only
              <li className="px-4 py-2">
                The data and charts available on Profitbook are solely for your
                personal analysis. You agree not to use this information as a
                basis for making investment decisions. Reliance on any
                information provided by this service is solely at your own risk.
              </li>
            </ol>
            <ol>
              4. Use License Subject
              <li className="px-4 py-2">
                to your compliance with these Terms of Service, Profitbook
                grants you a limited, non-exclusive, non-transferable, revocable
                license to use the application solely for your personal,
                non-commercial purposes strictly in accordance with the
                application&apos;s documentation.
              </li>
            </ol>
            <ol>
              5. No Redistribution
              <li className="px-4 py-2">
                You agree not to distribute, publish, or share the data and
                information from Profitbook with any third party, except for the
                purpose of discussing or illustrating your own trading analysis
                and decisions.
              </li>
            </ol>
            <ol>
              6. Intellectual Property Rights
              <li className="px-4 py-2">
                All content, data, and materials provided on Profitbook are the
                property of Profitbook or its content suppliers and are
                protected by intellectual property laws. You agree not to
                reproduce, duplicate, copy, sell, resell, or exploit any portion
                of the service without express written permission from us
              </li>
            </ol>
            <ol>
              7. Disclaimer of Warranties
              <li className="px-4 py-2">
                Profitbook is provided &quote;as is&quote; and without
                warranties of any kind. We do not warrant the accuracy,
                completeness, or usefulness of the information available on our
                platform.
              </li>
            </ol>
            <ol>
              8. Limitation of Liability
              <li className="px-4 py-2">
                Profitbook shall not be liable for any damages arising out of or
                in connection with the use of Profitbook. This limitation of
                liability applies to all damages of any kind.
              </li>
            </ol>
            <ol>
              9. Subscription Terms{" "}
              <li className="px-4 py-2">
                <div>
                  <b>a.</b> Profitbook offers a subscription-based service.
                  Monthly and annual subscriptions are available, and will be
                  charged to your approved payment method through Stripe.
                </div>
                <br />
                <div>
                  <b>b.</b> Subscriptions may be managed and auto-renewal may be
                  turned off by going to your Account Settings after purchase.
                </div>
              </li>
            </ol>
            <ol>
              10. Cancellation Policy
              <li className="px-4 py-2">
                Subscriptions can be canceled at any time. You will have access
                to your subscription until the end of the current billing cycle.
              </li>
            </ol>
            <ol>
              11. No Refunds
              <li className="px-4 py-2">
                Payments are nonrefundable and there are no refunds or credits
                for partially used periods, except as required by law.
              </li>
            </ol>
            <ol>
              12. User Content
              <li className="px-4 py-2">
                You are responsible for all the content that you upload, post,
                email, or otherwise transmit via the application. Profitbook
                does not claim ownership of the content you provide to the
                application.
              </li>
            </ol>
            <ol>
              13. Privacy Policy
              <li className="px-4 py-2">
                Your use of Profitbook is also governed by our{" "}
                <a
                  className="text-blue-500 underline"
                  href="/privacy-policy"
                  target="_blank"
                >
                  Privacy Policy
                </a>
                , which is incorporated herein by reference.
              </li>
            </ol>
            <ol>
              14. Changes to Terms
              <li className="px-4 py-2">
                Profitbook reserves the right, at our sole discretion, to modify
                or replace these Terms at any time. If a revision is material we
                will provide at least 30 days&apos; notice prior to any new
                terms taking effect.
              </li>
            </ol>
            <ol>
              8. Contact Us
              <li className="px-4 py-2">
                If you have any questions about these Terms, please contact us
                at{" "}
                <a
                  className="text-blue-500 underline"
                  href="mailto:support@profitbook.me"
                >
                  support@profitbook.me
                </a>{" "}
                or reach us directly on{" "}
                <a
                  className="text-blue-500 underline"
                  target="_blank"
                  href={`https://api.whatsapp.com/send?&text=I%20%20need%20some%20help%20with%20my%20account%20on%20Profitbook%20&phone=${env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                >
                  whatsapp
                </a>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
