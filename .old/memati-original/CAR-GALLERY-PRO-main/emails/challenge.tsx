import { Container, Heading, Section, Text } from "@react-email/components";

const PropDefaults = {
	code: 123456,
};

const baseUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: process.env.NEXT_PUBLIC_APP_URL;

const ChallengeEmail = ({ data = PropDefaults }) => {
    return (
        <>
            <Container style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <Section>
                    <Heading style={{ fontSize: '24px', marginBottom: '10px' }}>Your OTP Code</Heading>
                    <Text style={{ fontSize: '16px', marginBottom: '20px' }}>
                        Please use the following code to complete your authentication:
                    </Text>
                    <Text style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
                        {data.code}
                    </Text>
                </Section>
                <Section style={{ marginTop: '20px' }}>
                    <Text style={{ fontSize: '14px', color: '#666' }}>
                        If you did not request this code, please ignore this email.
                    </Text>
                </Section>
            </Container>
        </>
    )
}


export default ChallengeEmail;