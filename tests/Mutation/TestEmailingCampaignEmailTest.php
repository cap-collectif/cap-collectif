<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Enum\SendEmailingCampaignErrorCode;
use Capco\Tests\Mailer\EmailWebTestCase;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

/**
 * @internal
 *
 * @coversNothing
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Exercises authenticated GraphQL over HTTP and checks preview delivery and explicit rejection without sending.
 *
 * @runTestsInSeparateProcesses
 *
 * @preserveGlobalState disabled
 */
class TestEmailingCampaignEmailTest extends EmailWebTestCase
{
    public function testIncompleteCampaignDoesNotSendTestEmail(): void
    {
        $viewer = $this->em->getRepository(User::class)->find('user1');
        self::assertInstanceOf(User::class, $viewer);
        $this->browser->loginUser($viewer, 'main');
        $emails = $this->emails;

        $result = $this->previewCampaign('CampaignToProjectWithOwner');

        self::assertSame(SendEmailingCampaignErrorCode::CANNOT_BE_SENT, $result['error']);
        self::assertNull($result['html']);
        self::assertCount(0, $emails->messages);
    }

    public function testCampaignPreviewSendsExactlyOneEmailToTheTestAddress(): void
    {
        $viewer = $this->em->getRepository(User::class)->find('user1');
        self::assertInstanceOf(User::class, $viewer);
        $this->browser->loginUser($viewer, 'main');
        $emails = $this->emails;
        $result = $this->previewCampaign('CampaignToCovidParticipants');

        self::assertNull($result['error']);
        self::assertNotEmpty($result['html']);
        self::assertCount(1, $emails->messages);
        $message = $emails->messages[0];
        self::assertSame('preview-recipient@example.com', $message->getTo()[0]->getAddress());
        self::assertNotEmpty($message->getFrom());
        self::assertNotEmpty($message->getSubject());
        self::assertStringContainsString('Second confinement', (string) $message->getSubject());
        self::assertStringContainsString('relancer le projet', (string) $message->getHtmlBody());
    }

    /** @return array<string, mixed> */
    private function previewCampaign(string $campaignId): array
    {
        return $this->graphql(
            'mutation($input: TestEmailingCampaignInput!) { testEmailingCampaign(input: $input) { error html } }',
            ['input' => [
                'id' => GlobalId::toGlobalId('EmailingCampaign', $campaignId),
                'email' => 'preview-recipient@example.com',
            ]]
        )['testEmailingCampaign'];
    }
}
