<?php

namespace Capco\Tests\UnitTests;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Mailer\Enum\RecipientType;
use Capco\AppBundle\Mailer\Model\EmailCampaignRecipient;
use Capco\AppBundle\Mailer\Recipient\MessageBuilder;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @internal
 * @coversNothing
 */
final class EmailCampaignMessageBuilderTest extends TestCase
{
    public function testMessagesUseRecipientLinksAndReuseGeneratedRoutes(): void
    {
        $router = $this->createMock(UrlGeneratorInterface::class);
        $router->expects($this->exactly(2))->method('generate')->willReturnMap([
            ['capco_app_action_token', ['token' => '_UNSUBSCRIBE_TOKEN_'], UrlGeneratorInterface::ABSOLUTE_URL, 'https://capco.test/action/_UNSUBSCRIBE_TOKEN_'],
            ['capco_app_unsubscribe_anonymous', ['token' => '_UNSUBSCRIBE_TOKEN_', 'email' => '_EMAIL_'], UrlGeneratorInterface::ABSOLUTE_URL, 'https://capco.test/unsubscribe/_UNSUBSCRIBE_TOKEN_?email=_EMAIL_'],
        ]);
        $builder = new MessageBuilder($this->createTranslator(), $router);
        $campaign = (new EmailingCampaign())->setContent('Campaign content');
        $user = new EmailCampaignRecipient('user@example.org', RecipientType::User, 'user-id', 'User', 'fr-FR', null, 'user-token');
        $participant = new EmailCampaignRecipient('participant+test@example.org', RecipientType::Participant, 'participant-id', 'Participant', 'fr-FR', 'participant-token');

        $userMessage = $builder->buildOneMessage($campaign, $user, '<p>Content</p>', 'Site', 'https://capco.test');
        $participantMessage = $builder->buildOneMessage($campaign, $participant, '<p>Content</p>', 'Site', 'https://capco.test');
        $repeatedMessage = $builder->buildOneMessage($campaign, $user, '<p>Content</p>', 'Site', 'https://capco.test');

        self::assertSame('https://capco.test/action/user-token', $userMessage['Variables']['unsubscribePart']);
        self::assertSame('https://capco.test/unsubscribe/participant-token?email=participant%2Btest%40example.org', $participantMessage['Variables']['unsubscribePart']);
        self::assertSame($userMessage, $repeatedMessage);
    }

    public function testRouteFailureIsPropagatedAndInitializationCanBeRetried(): void
    {
        $router = $this->createMock(UrlGeneratorInterface::class);
        $attempt = 0;
        $router->expects($this->exactly(4))->method('generate')->willReturnCallback(
            static function (string $name) use (&$attempt): string {
                ++$attempt;
                if (2 === $attempt) {
                    throw new \RuntimeException('Database unavailable');
                }

                return 'https://capco.test/' . $name . '/_UNSUBSCRIBE_TOKEN_';
            }
        );
        $builder = new MessageBuilder($this->createTranslator(), $router);
        $campaign = (new EmailingCampaign())->setContent('Campaign content');
        $recipient = new EmailCampaignRecipient('user@example.org', RecipientType::User, 'user-id', 'User', 'fr-FR', null, 'user-token');

        $failure = null;

        try {
            $builder->buildOneMessage($campaign, $recipient, '', 'Site', 'https://capco.test');
        } catch (\RuntimeException $exception) {
            $failure = $exception;
        }
        self::assertInstanceOf(\RuntimeException::class, $failure);
        self::assertSame('Database unavailable', $failure->getMessage());

        $message = $builder->buildOneMessage($campaign, $recipient, '', 'Site', 'https://capco.test');
        self::assertSame('https://capco.test/capco_app_action_token/user-token', $message['Variables']['unsubscribePart']);
    }

    private function createTranslator(): TranslatorInterface
    {
        $translator = $this->createStub(TranslatorInterface::class);
        $translator->method('trans')->willReturnCallback(
            static fn (string $id): string => 'click-here-to-unsubscribe' === $id ? '_UNSUBSCRIBE_URL_' : $id
        );

        return $translator;
    }
}
