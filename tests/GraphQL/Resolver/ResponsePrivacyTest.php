<?php

namespace Capco\Tests\GraphQL\Resolver;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalAnalysis;
use Capco\AppBundle\Entity\ProposalAnalyst;
use Capco\AppBundle\Entity\ProposalEvaluation;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\PublicApiToken;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\Tests\IdentityWebTestCase;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\BrowserKit\Cookie;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises raw and global response IDs over HTTP for anonymous, owner, analyst and administrator identities.
 */
final class ResponsePrivacyTest extends IdentityWebTestCase
{
    private ?string $apiToken = null;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setFeature('public_api', true);
    }

    /** @dataProvider responses */
    public function testDirectReadsRespectResponsePermissions(string $source, bool $private, bool $hidden): void
    {
        $owner = $this->account();
        $analyst = $this->account();
        $question = (new SimpleQuestion())->setTitle('Response access')->setType(0)->setPrivate($private)->setHidden($hidden);
        $response = (new ValueResponse())->setQuestion($question)->setValue('SYNTHETIC_RESPONSE');
        $proposal = null;
        $hasProposal = \in_array($source, ['proposal', 'analysis', 'evaluation'], true);
        if ($hasProposal) {
            $proposal = (new Proposal())->setTitle('Response access')->setProposalForm($this->em->getRepository(ProposalForm::class)->findOneBy([]))->setAuthor($owner)->setDraft(false)->setPublishedAt(new \DateTime('2020-01-01'));
            $assignment = new ProposalAnalyst($proposal, $analyst);
            $proposal->addProposalAnalyst($assignment);
            $this->em->persist($proposal);
            $this->em->persist($assignment);
            if ('analysis' === $source) {
                $analysis = (new ProposalAnalysis())->setProposal($proposal)->setUpdatedBy($owner);
                $response->setAnalysis($analysis);
                $this->em->persist($analysis);
            } elseif ('evaluation' === $source) {
                $evaluation = (new ProposalEvaluation())->setProposal($proposal);
                $proposal->setProposalEvaluation($evaluation);
                $response->setProposalEvaluation($evaluation);
                $this->em->persist($evaluation);
            } else {
                $response->setProposal($proposal);
            }
        } elseif ('profile' === $source) {
            $response->setUser($owner);
        }
        $this->em->persist($question);
        $this->em->persist($response);
        $admin = $this->account()->addRole('ROLE_ADMIN');
        $this->em->flush();

        foreach (['anonymous' => null, 'other' => $this->account(), 'owner' => $owner, 'analyst' => $analyst, 'admin' => $admin] as $role => $viewer) {
            if ($viewer) {
                $this->login($viewer->getEmail());
                $this->apiToken = bin2hex(random_bytes(16));
                $this->em->persist(new PublicApiToken($this->em->find(User::class, $viewer->getId()), $this->apiToken));
                $this->em->flush();
            }
            $allowed = 'admin' === $role || ('analyst' === $role && $hasProposal)
                || ('orphan' !== $source && 'analysis' !== $source && !$hidden
                    && (!$private || ('owner' === $role && 'evaluation' !== $source)));
            $this->assertDirectAccess($response, $allowed);
            if ('evaluation' === $source) {
                self::assertNotNull($proposal);
                $result = $this->graphql('query($id:ID!){node(id:$id){...on Proposal{evaluation{responses{question{title} ...on ValueResponse{value}}}}}}', ['id' => GlobalId::toGlobalId('Proposal', $proposal->getId())]);
                $responses = array_values(array_filter($result['node']['evaluation']['responses'], static fn (array $answer) => 'Response access' === $answer['question']['title']));
                self::assertSame($allowed ? [['question' => ['title' => 'Response access'], 'value' => 'SYNTHETIC_RESPONSE']] : [], $responses);
            }
            if ($viewer) {
                $this->logout();
                $this->apiToken = null;
            }
        }
    }

    /** @return iterable<string, array{string, bool, bool}> */
    public static function responses(): iterable
    {
        foreach (['proposal', 'profile', 'evaluation'] as $source) {
            yield $source . ' private' => [$source, true, false];
            yield $source . ' hidden' => [$source, false, true];
            yield $source . ' public' => [$source, false, false];
        }
        yield 'analysis with a public question' => ['analysis', false, false];
        yield 'orphan' => ['orphan', false, false];
    }

    public function testParticipantIdentityAndSignedInPrecedence(): void
    {
        $participant = (new Participant())->setToken(bin2hex(random_bytes(16)));
        $proposal = (new Proposal())->setTitle('Participant response')->setProposalForm($this->em->getRepository(ProposalForm::class)->findOneBy([]))->setParticipant($participant);
        $question = (new SimpleQuestion())->setTitle('Private response')->setType(0)->setPrivate(true);
        $response = (new ValueResponse())->setQuestion($question)->setProposal($proposal)->setValue('SYNTHETIC_RESPONSE');
        foreach ([$participant, $proposal, $question, $response] as $entity) {
            $this->em->persist($entity);
        }
        $this->em->flush();
        $this->assertDirectAccess($response, false);
        $this->browser->getCookieJar()->set(new Cookie('CapcoParticipant', base64_encode($participant->getToken())));
        $this->assertDirectAccess($response, true);
        $viewer = $this->account();
        $this->login($viewer->getEmail());
        $this->apiToken = bin2hex(random_bytes(16));
        $this->em->persist(new PublicApiToken($this->em->find(User::class, $viewer->getId()), $this->apiToken));
        $this->em->flush();
        $this->assertDirectAccess($response, false);
    }

    public function testEmptyPrivateResponsesRetainTheirParentPermissions(): void
    {
        $owner = $this->account();
        $form = $this->em->getRepository(ProposalForm::class)->findOneBy([]);
        $proposal = (new Proposal())->setTitle('Unanswered questions')->setProposalForm($form)->setAuthor($owner)->setDraft(false)->setPublishedAt(new \DateTime('2020-01-01'));
        $question = (new SimpleQuestion())->setTitle('Empty private response')->setType(0)->setPrivate(true);
        $association = (new QuestionnaireAbstractQuestion())->setQuestion($question)->setProposalForm($form)->setPosition(1000);
        $form->addQuestion($association);
        $this->em->persist($proposal);
        $this->em->persist($association);
        $apiToken = bin2hex(random_bytes(16));
        $this->em->persist(new PublicApiToken($owner, $apiToken));
        $this->em->flush();
        $this->login($owner->getEmail());
        foreach (['internal', 'preview'] as $schema) {
            $this->browser->request('POST', 'preview' === $schema ? '/graphql' : '/graphql/internal', [], [], [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_ACCEPT' => 'preview' === $schema ? 'application/vnd.cap-collectif.preview+json' : 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer ' . $apiToken,
            ], json_encode(['query' => 'query($id:ID!){node(id:$id){...on Proposal{responses{question{title} ...on ValueResponse{value formattedValue}}}}}', 'variables' => ['id' => GlobalId::toGlobalId('Proposal', $proposal->getId())]], \JSON_THROW_ON_ERROR));
            self::assertResponseStatusCodeSame(200);
            $result = json_decode((string) $this->browser->getResponse()->getContent(), true, 512, \JSON_THROW_ON_ERROR);
            self::assertArrayNotHasKey('errors', $result, json_encode($result, \JSON_THROW_ON_ERROR));
            self::assertArrayNotHasKey('warnings', $result['extensions'] ?? []);
            $responses = array_values(array_filter($result['data']['node']['responses'], static fn (array $response) => 'Empty private response' === $response['question']['title']));
            self::assertSame([['question' => ['title' => 'Empty private response'], 'value' => null, 'formattedValue' => null]], $responses);
        }
    }

    private function assertDirectAccess(ValueResponse $response, bool $allowed): void
    {
        $id = GlobalId::toGlobalId('ValueResponse', $response->getId());
        $query = 'query($id:ID!,$raw:ID!,$ids:[ID!]!){global:node(id:$id){...on ValueResponse{value formattedValue}}raw:node(id:$raw){...on ValueResponse{value formattedValue}}nodes(ids:$ids){...on ValueResponse{value formattedValue}}}';
        foreach (['internal', 'dev'] as $schema) {
            $this->browser->jsonRequest('POST', '/graphql/' . $schema, ['query' => $query, 'variables' => ['id' => $id, 'raw' => $response->getId(), 'ids' => [$id, $response->getId()]]]);
            self::assertResponseStatusCodeSame(200);
            $result = json_decode((string) $this->browser->getResponse()->getContent(), true, 512, \JSON_THROW_ON_ERROR);
            self::assertArrayNotHasKey('errors', $result, json_encode($result, \JSON_THROW_ON_ERROR));
            foreach ([$result['data']['global'], $result['data']['raw'], ...$result['data']['nodes']] as $node) {
                self::assertSame($allowed ? ['value' => 'SYNTHETIC_RESPONSE', 'formattedValue' => 'SYNTHETIC_RESPONSE'] : null, $node);
            }
        }
        if (!$allowed) {
            foreach (['public', 'preview'] as $schema) {
                $this->browser->request('POST', 'preview' === $schema ? '/graphql' : '/graphql/public', [], [], [
                    'CONTENT_TYPE' => 'application/json',
                    'HTTP_ACCEPT' => 'preview' === $schema ? 'application/vnd.cap-collectif.preview+json' : 'application/json',
                    ...($this->apiToken ? ['HTTP_AUTHORIZATION' => 'Bearer ' . $this->apiToken] : []),
                ], json_encode(['query' => 'query($ids:[ID!]!){nodes(ids:$ids){id}}', 'variables' => ['ids' => [$id, $response->getId()]]], \JSON_THROW_ON_ERROR));
                self::assertResponseStatusCodeSame(200);
                $result = json_decode((string) $this->browser->getResponse()->getContent(), true, 512, \JSON_THROW_ON_ERROR);
                self::assertArrayNotHasKey('errors', $result, json_encode($result, \JSON_THROW_ON_ERROR));
                self::assertSame([null, null], $result['data']['nodes']);
            }
        }
    }
}
