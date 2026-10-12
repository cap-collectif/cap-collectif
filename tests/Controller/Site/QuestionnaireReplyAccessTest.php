<?php

namespace Capco\Tests\Controller\Site;

use Capco\AppBundle\Entity\Reply;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\BrowserKit\Cookie;

/**
 * @internal
 * @coversNothing
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Verifies reply-page access through HTTP using read-only fixtures.
 */
class QuestionnaireReplyAccessTest extends WebTestCase
{
    /** @dataProvider credentials */
    public function testReplyPageCredentialPrecedence(?string $participantToken, bool $replyCookie, ?string $userId, string $replyId, bool $allowed): void
    {
        $client = self::createClient(['environment' => 'test']);
        $entityManager = self::getContainer()->get('doctrine')->getManager();
        $reply = $entityManager->find(Reply::class, $replyId);
        self::assertInstanceOf(Reply::class, $reply);
        $step = $reply->getQuestionnaire()->getStep();
        $parameters = [
            'projectSlug' => $step->getProject()->getSlug(),
            'stepSlug' => $step->getSlug(),
        ];
        $router = self::getContainer()->get('router');
        $questionnaireUrl = $router->generate('app_project_show_questionnaire', $parameters);
        $replyUrl = $router->generate('app_project_show_questionnaire_reply', $parameters + [
            'replyId' => GlobalId::toGlobalId('Reply', $replyId),
        ]);

        if ($userId) {
            $user = $entityManager->find(User::class, $userId);
            self::assertInstanceOf(User::class, $user);
            $client->loginUser($user);
        }
        if (null !== $participantToken) {
            $client->getCookieJar()->set(new Cookie('CapcoParticipant', base64_encode($participantToken)));
        }
        if ($replyCookie) {
            $cookie = base64_encode(json_encode([
                GlobalId::toGlobalId('Questionnaire', 'questionnaireAnonymous') => [[
                    'replyId' => GlobalId::toGlobalId('Reply', 'replyAnonymous1'),
                    'token' => 'fakeToken1',
                ]],
            ], \JSON_THROW_ON_ERROR));
            $client->getCookieJar()->set(new Cookie('CapcoAnonReply', $cookie));
        }

        $entityManager->clear();
        $client->request('GET', $replyUrl);

        if ($allowed) {
            self::assertResponseIsSuccessful();
            self::assertStringContainsString('ProjectStepPageApp', (string) $client->getResponse()->getContent());
        } else {
            self::assertResponseRedirects($questionnaireUrl);
        }
    }

    /** @return \Generator<string, array{null|string, bool, null|string, string, bool}> */
    public static function credentials(): \Generator
    {
        yield 'participant owner needs no reply cookie' => ['fakeToken1', false, null, 'replyAnonymous1', true];
        yield 'participant owner can read a draft' => ['fakeToken1', false, null, 'replyAnonymousDraft', true];
        yield 'no credentials grant nothing' => [null, false, null, 'replyAnonymous1', false];
        yield 'different participant is denied' => ['fakeToken2', false, null, 'replyAnonymous1', false];
        yield 'exact reply cookie remains supported' => [null, true, null, 'replyAnonymous1', true];
        yield 'reply cookie cannot authorize another reply' => [null, true, null, 'replyAnonymous1bis', false];
        yield 'different participant overrides reply cookie' => ['fakeToken2', true, null, 'replyAnonymous1', false];
        yield 'invalid participant never falls back' => ['invalid', true, null, 'replyAnonymous1', false];
        yield 'signed-in non-owner ignores participant cookies' => ['fakeToken1', true, 'user10', 'replyAnonymous1', false];
        yield 'signed-in author ignores invalid participant cookie' => ['invalid', false, 'user10', 'replyQuestionnaireAnonDraft', true];
        yield 'manager uses the shared reply policy' => [null, false, 'userTheo', 'replyAnonQuestionnaireAnonPOwner', true];
    }
}
