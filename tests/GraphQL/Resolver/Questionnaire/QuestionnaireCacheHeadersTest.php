<?php

namespace Capco\Tests\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\Tests\IdentityWebTestCase;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\BrowserKit\Cookie;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Exercises actual HTTP headers for private replies accessed with the legacy participant cookie.
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 */
final class QuestionnaireCacheHeadersTest extends IdentityWebTestCase
{
    public function testLegacyCookieReturnsPrivateDataWithAnonymousCacheHeader(): void
    {
        $owner = $this->account();
        $questionnaire = (new Questionnaire())->setTitle('Private cache test')->setOwner($owner);
        $participant = (new Participant())->setToken(bin2hex(random_bytes(16)));
        $reply = (new Reply())->setQuestionnaire($questionnaire)->setParticipant($participant);
        $question = (new SimpleQuestion())->setTitle('Secret')->setType(0);
        $response = (new ValueResponse())->setQuestion($question)->setReply($reply)->setValue('SYNTHETIC_PRIVATE_REPLY');
        foreach ([$questionnaire, $participant, $reply, $question, $response] as $entity) {
            $this->em->persist($entity);
        }
        $this->em->flush();
        $cookie = base64_encode(json_encode([GlobalId::toGlobalId('Questionnaire', $questionnaire->getId()) => [['replyId' => GlobalId::toGlobalId('Reply', $reply->getId()), 'token' => $participant->getToken()]]], \JSON_THROW_ON_ERROR));
        $this->browser->getCookieJar()->set(new Cookie('CapcoAnonReply', $cookie, null, '/', 'projet.lesecologistes.fr'));
        $this->browser->request('POST', 'https://projet.lesecologistes.fr/graphql/internal', [], [], ['HTTP_HOST' => 'projet.lesecologistes.fr', 'CONTENT_TYPE' => 'application/json'], json_encode(['query' => 'query($id:ID!){node(id:$id){...on ValueResponse{value}}}', 'variables' => ['id' => GlobalId::toGlobalId('ValueResponse', $response->getId())]], \JSON_THROW_ON_ERROR));
        $http = $this->browser->getResponse();
        self::assertResponseStatusCodeSame(200);
        $result = json_decode((string) $http->getContent(), true, 512, \JSON_THROW_ON_ERROR);
        self::assertSame('SYNTHETIC_PRIVATE_REPLY', $result['data']['node']['value'] ?? null, json_encode($result, \JSON_THROW_ON_ERROR));
        self::assertSame('0', $http->headers->get('X-User-Logged-In'));
        self::assertTrue($http->headers->hasCacheControlDirective('no-store'));
    }
}
