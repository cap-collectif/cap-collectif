<?php

namespace Capco\Tests\Mutation;

use Capco\Tests\Mailer\EmailWebTestCase;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

/**
 * @internal
 *
 * @coversNothing
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Exercises the contact form over GraphQL HTTP and checks outbound content and rejection without email delivery.
 *
 * @runTestsInSeparateProcesses
 *
 * @preserveGlobalState disabled
 */
class ContactFormEmailTest extends EmailWebTestCase
{
    public function testContactFormSendsTheSubmittedMessage(): void
    {
        $result = $this->submitContactForm('visitor@example.com');

        self::assertArrayNotHasKey('errors', $result, json_encode($result, \JSON_THROW_ON_ERROR));
        self::assertCount(1, $this->emails->messages);
        $email = $this->emails->messages[0];
        self::assertSame('admin1@email.com', $email->getTo()[0]->getAddress());
        self::assertSame('visitor@example.com', $email->getReplyTo()[0]->getAddress());
        self::assertStringContainsString('Question subject', (string) $email->getSubject());
        self::assertStringContainsString('The actual question', (string) $email->getHtmlBody());
    }

    public function testInvalidContactFormDoesNotSendEmail(): void
    {
        $result = $this->submitContactForm('not-an-email');

        self::assertSame(['sendContactForm'], $result['errors'][0]['path']);
        self::assertStringContainsString('email', strtolower((string) $result['errors'][0]['message']));
        self::assertCount(0, $this->emails->messages);
    }

    /** @return array<string, mixed> */
    private function submitContactForm(string $email): array
    {
        return $this->graphResponse(
            'mutation($input: SendContactFormInput!) { sendContactForm(input: $input) { clientMutationId } }',
            ['input' => [
                'idContactForm' => GlobalId::toGlobalId('ContactForm', 'contactForm1'),
                'email' => $email,
                'name' => 'Visitor Name',
                'title' => 'Question subject',
                'body' => 'The actual question',
                'captcha' => 'captcha-value',
            ]]
        );
    }
}
