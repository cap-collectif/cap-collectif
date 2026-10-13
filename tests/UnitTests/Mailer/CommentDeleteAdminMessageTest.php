<?php

namespace CapcoTests\UnitTests\Mailer;

use Capco\AppBundle\Mailer\Message\Comment\CommentDeleteAdminAnonymousMessage;
use Capco\AppBundle\Mailer\Message\Comment\CommentDeleteAdminMessage;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @coversNothing
 */
class CommentDeleteAdminMessageTest extends TestCase
{
    /**
     * @dataProvider deletionMessageClasses
     */
    public function testDefaultsMessagesQueuedBeforeObjectTypeWasAddedToProposal(string $messageClass): void
    {
        $params = [
            'authorURL' => 'https://example.test/users/jane',
            'proposalURL' => 'https://example.test/projects/project/proposals/proposal',
            'comment' => [
                'username' => 'Jane',
                'proposal' => 'Proposal',
                'body' => 'Comment',
            ],
        ];

        self::assertSame('proposal', $messageClass::getMyTemplateVars(null, $params)['objectType']);
        self::assertSame('proposal', $messageClass::getMySubjectVars(null, $params)['objectType']);
    }

    /**
     * @return list<array{class-string}>
     */
    public function deletionMessageClasses(): array
    {
        return [
            [CommentDeleteAdminAnonymousMessage::class],
            [CommentDeleteAdminMessage::class],
        ];
    }
}
