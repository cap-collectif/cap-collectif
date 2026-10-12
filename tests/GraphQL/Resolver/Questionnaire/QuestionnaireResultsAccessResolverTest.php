<?php

namespace Capco\Tests\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireResultsAccessResolver;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\AppBundle\Service\CapcoAnonReplyDecoder;
use Capco\AppBundle\Service\ParticipantAccessResolver;
use Capco\UserBundle\Entity\User;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

/**
 * @internal
 * @coversNothing
 * @phpunit-status compliant
 * @phpunit-reason Exercises fail-closed identity checks and missing credentials using real domain objects.
 */
class QuestionnaireResultsAccessResolverTest extends TestCase
{
    public function testMissingIdentitiesNeverGrantReplyAccess(): void
    {
        $authorizationChecker = $this->createMock(AuthorizationCheckerInterface::class);
        $authorizationChecker->method('isGranted')->willReturn(false);
        $access = new QuestionnaireResultsAccessResolver(
            $authorizationChecker,
            $this->createMock(ParticipantAccessResolver::class),
            new RequestStack(),
            $this->createMock(QuestionnaireRepository::class),
            $this->createMock(ReplyRepository::class),
            new CapcoAnonReplyDecoder(),
            $this->createMock(\Capco\AppBundle\Service\ParticipantAuthentication::class),
            $this->createMock(\Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalViewerIsAnEvaluerResolver::class)
        );
        $orphan = new Reply();
        self::assertFalse($access->canViewReply($orphan));
        $questionnaire = new Questionnaire();
        $reply = (new Reply())->setId('created')->setQuestionnaire($questionnaire);
        $other = (new Reply())->setId('other')->setQuestionnaire($questionnaire);
        self::assertFalse($access->canViewReply($reply));
        self::assertFalse($access->canViewReply($reply, new User()));
        $response = (new ValueResponse())->setReply($reply);
        self::assertFalse($access->canViewResponse($response));

        $context = new \ArrayObject();
        self::assertFalse($access->canViewReply($reply, null, $context));
        self::assertFalse($access->canViewReply($other, null, $context));
        self::assertFalse($access->canViewReply($reply, null, new \ArrayObject()));
        self::assertTrue($access->canViewReply($other, null, new \ArrayObject(['disable_acl' => true])));
        self::assertFalse($access->canViewResponse(new ValueResponse()));
    }
}
