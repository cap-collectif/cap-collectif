<?php

namespace Capco\Tests\Mutation;

use Capco\Tests\IdentityWebTestCase;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Verifies notification dispatch at the broker boundary; API behavior is covered by Jest.
 */
final class UpdateUserReplyMutationTest extends IdentityWebTestCase
{
    /** @dataProvider notificationScenarios */
    public function testOnlySuccessfulPublicationDispatchesANotification(string $kind, bool $notified): void
    {
        $author = $this->account();
        $questionnaire = $this->em->getRepository(\Capco\AppBundle\Entity\Questionnaire::class)->findOneBy([]);
        $questionnaire->setAnonymousAllowed(true);
        $questionnaire->getNotificationsConfiguration()->setOnQuestionnaireReplyUpdate(true);
        $questionnaire->getStep()->setTimeless(true);
        foreach ($questionnaire->getQuestions() as $association) {
            $association->getQuestion()->setRequired('invalid' === $kind);
        }
        $reply = (new \Capco\AppBundle\Entity\Reply())->setAuthor($author)->setQuestionnaire($questionnaire)->setDraft(true);
        $this->em->persist($reply);
        $this->em->flush();
        $id = $reply->getId();
        $this->login('other' === $kind ? $this->account()->getEmail() : $author->getEmail());
        $this->graphResponse('mutation($input: UpdateUserReplyInput!) { updateUserReply(input: $input) { reply { id } } }', ['input' => ['replyId' => GlobalId::toGlobalId('Reply', 'missing' === $kind ? 'missing' : $id), 'draft' => false, 'responses' => []]]);
        self::assertSame($notified ? [['type' => 'questionnaire.reply', 'body' => ['replyId' => $id, 'state' => 'create']]] : [], $this->messages);
    }

    /** @return iterable<string, array{string, bool}> */
    public static function notificationScenarios(): iterable
    {
        yield 'publish draft' => ['valid', true];
        yield 'missing reply' => ['missing', false];
        yield 'another author' => ['other', false];
        yield 'required answers missing' => ['invalid', false];
    }
}
