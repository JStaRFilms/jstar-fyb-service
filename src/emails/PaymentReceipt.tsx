import * as React from 'react';
import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Tailwind,
} from '@react-email/components';

interface PaymentReceiptEmailProps {
    name: string;
    amount: number;
    reference: string;
    projectTopic: string;
    date: Date;
}

export const PaymentReceiptEmail = ({
    name,
    amount,
    reference,
    projectTopic,
    date,
}: PaymentReceiptEmailProps) => {
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <Html>
            <Head />
            <Preview>Payment Receipt for {projectTopic}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Payment Confirmed
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hello {name},
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Thanks for unlocking your project. We've received your payment of <strong>₦{amount.toLocaleString()}</strong>.
                        </Text>

                        <Section className="bg-[#f2f3f3] rounded mr-auto ml-auto mb-6 p-4">
                            <Text className="text-black text-[14px] leading-[24px] font-bold m-0 p-0">
                                Receipt Details
                            </Text>
                            <Text className="text-black text-[14px] leading-[24px] m-0 mt-2">
                                <strong>Reference:</strong> {reference}
                            </Text>
                            <Text className="text-black text-[14px] leading-[24px] m-0">
                                <strong>Project:</strong> {projectTopic}
                            </Text>
                            <Text className="text-black text-[14px] leading-[24px] m-0">
                                <strong>Date:</strong> {formattedDate}
                            </Text>
                        </Section>

                        <Text className="text-black text-[14px] leading-[24px]">
                            You can now access your full project documentation, including all chapters and generated materials.
                        </Text>

                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Link
                                className="bg-[#8b5cf6] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href="https://fyb.jstarstudios.com/project/builder"
                            >
                                Go to Project Builder
                            </Link>
                        </Section>

                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            If you have any questions, reply to this email or contact support.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default PaymentReceiptEmail;
