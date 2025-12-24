import { Container, Heading, Section, Text } from "@react-email/components";

const PropDefaults = {
	code: 123456,
    title: "Your OTP Code",
    description: "Please use the following code to complete your authentication:",
    ignore: "If you did not request this code, please ignore this email."
};

const baseUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: process.env.NEXT_PUBLIC_APP_URL;

const ChallengeEmail = ({ data = PropDefaults }) => {
    return (
        <>
            <Container style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <Section>
                    <Heading style={{ fontSize: '24px', marginBottom: '10px' }}>{data.title}</Heading>
                    <Text style={{ fontSize: '16px', marginBottom: '20px' }}>
                        {data.description}
                    </Text>
                    <Text style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
                        {data.code}
                    </Text>
                </Section>
                <Section style={{ marginTop: '20px' }}>
                    <Text style={{ fontSize: '14px', color: '#666' }}>
                        {data.ignore}
                    </Text>
                </Section>
            </Container>
        </>
    )
}


export default ChallengeEmail;