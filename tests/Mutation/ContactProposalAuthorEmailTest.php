<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Enum\ContactProposalAuthorErrorCode;
use Capco\AppBundle\Security\CaptchaChecker;
use Capco\Tests\Mailer\EmailWebTestCase;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

/**
 * @internal
 *
 * @coversNothing
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Exercises GraphQL over HTTP and checks captured emails, explicit errors and freshly loaded SQL effects.
 *
 * @runTestsInSeparateProcesses
 *
 * @preserveGlobalState disabled
 */
class ContactProposalAuthorEmailTest extends EmailWebTestCase
{
    /** @dataProvider contactScenarios */
    public function testContactProposalAuthorRespectsCaptchaAndSendsToAuthor(bool $captchaValid): void
    {
        $proposal = $this->em->getRepository(Proposal::class)->find('proposal109');
        self::assertInstanceOf(Proposal::class, $proposal);
        $emails = $this->emails;
        $captcha = $this->createStub(CaptchaChecker::class);
        $captcha->method('__invoke')->willReturn($captchaValid);
        self::getContainer()->set(CaptchaChecker::class, $captcha);
        $initialContactCount = $proposal->getStatistics()?->getNbrOfMessagesSentToAuthor() ?? 0;
        $this->em->clear();

        $result = $this->graphql(
            'mutation($input: ContactProposalAuthorInput!) { contactProposalAuthor(input: $input) { error } }',
            ['input' => [
                'proposalId' => GlobalId::toGlobalId('Proposal', 'proposal109'),
                'captcha' => 'known-captcha',
                'senderName' => 'Ada',
                'replyEmail' => 'ada@example.com',
                'message' => 'A concrete question about the proposal',
            ]]
        )['contactProposalAuthor'];
        $this->em->clear();
        $proposal = $this->em->find(Proposal::class, 'proposal109');
        self::assertInstanceOf(Proposal::class, $proposal);

        if (!$captchaValid) {
            self::assertSame(ContactProposalAuthorErrorCode::INVALID_CAPTCHA, $result['error']);
            self::assertCount(0, $emails->messages);
            self::assertSame($initialContactCount, $proposal->getStatistics()?->getNbrOfMessagesSentToAuthor() ?? 0);

            return;
        }

        self::assertNull($result['error']);
        self::assertSame($initialContactCount + 1, $proposal->getStatistics()->getNbrOfMessagesSentToAuthor());
        self::assertCount(1, $emails->messages);
        $email = $emails->messages[0];
        self::assertSame($proposal->getAuthor()->getEmail(), $email->getTo()[0]->getAddress());
        self::assertNotEmpty($email->getFrom());
        self::assertNotEmpty($email->getSubject());
        self::assertStringContainsString('A concrete question about the proposal', (string) $email->getHtmlBody());
    }

    /** @return iterable<string, array{bool}> */
    public static function contactScenarios(): iterable
    {
        yield 'valid contact' => [true];

        yield 'invalid captcha' => [false];
    }
}
