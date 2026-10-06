<?php

namespace Capco\Tests\Mutation;

use Capco\Tests\IdentityWebTestCase;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class UpdateUserReplyMutationTest extends IdentityWebTestCase
{
    /** @dataProvider updates */
    public function testOnlyTheAuthorCanPublishAValidDraftReply(string $kind, ?string $error): void
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
        $result = $this->graphResponse('mutation($input: UpdateUserReplyInput!) { updateUserReply(input: $input) { reply { id } } }', ['input' => ['replyId' => GlobalId::toGlobalId('Reply', 'missing' === $kind ? 'missing' : $id), 'draft' => false, 'responses' => []]]);
        if (null === $error) {
            self::assertArrayNotHasKey('errors', $result);
            self::assertSame(GlobalId::toGlobalId('Reply', $id), $result['data']['updateUserReply']['reply']['id']);
            self::assertContains(['type' => 'questionnaire.reply', 'body' => ['replyId' => $id, 'state' => 'create']], $this->messages);
        } else {
            if ('invalid' === $kind) {
                self::assertStringStartsWith($error, $result['errors'][0]['message']);
            } else {
                self::assertSame($error, $result['errors'][0]['message']);
            }
            self::assertSame([], $this->messages);
        }
        $this->em->clear();
        $persisted = $this->em->find(\Capco\AppBundle\Entity\Reply::class, $id);
        self::assertSame(null !== $error, $persisted->isDraft());
        if (null === $error) {
            self::assertNotNull($persisted->getPublishedAt());
        }
    }

    /** @return iterable<string, array{string, ?string}> */
    public static function updates(): iterable
    {
        yield 'publish draft' => ['valid', null];
        yield 'missing reply' => ['missing', 'Reply not found.'];
        yield 'another author' => ['other', 'You are not allowed to update this reply.'];
        yield 'required answers missing' => ['invalid', 'reply.missing_required_responses '];
    }
}
