<?php

namespace Capco\Tests\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalResponsesResolver;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalViewerIsAnEvaluerResolver;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Capco\AppBundle\Service\ParticipantHelper;
use FOS\UserBundle\Util\TokenGenerator;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

/**
 * @internal
 * @coversNothing
 */
class ProposalResponsesResolverTest extends TestCase
{
    public function testParticipantCanReadOnlyTheirPrivateResponses(): void
    {
        $author = new Participant();
        $proposal = (new Proposal())->setParticipant($author)->setProposalForm(new ProposalForm());
        $public = (new ValueResponse())->setQuestion((new SimpleQuestion())->setPrivate(false));
        $private = (new ValueResponse())->setQuestion((new SimpleQuestion())->setPrivate(true));
        $hidden = (new ValueResponse())->setQuestion((new SimpleQuestion())->setPrivate(true)->setHidden(true));
        $questions = $this->createMock(AbstractQuestionRepository::class);
        $questions->method('findByProposalForm')->willReturn([]);
        $responses = $this->createMock(AbstractResponseRepository::class);
        $responses->method('getByProposal')->willReturn([$public, $private, $hidden]);
        $helper = $this->createMock(ParticipantHelper::class);
        $helper->method('getParticipantByToken')->willReturnCallback(static function (string $token) use ($author): Participant {
            if ('invalid' === $token) {
                throw new ParticipantNotFoundException();
            }

            return 'author' === $token ? $author : new Participant();
        });
        $resolver = new ProposalResponsesResolver(
            $questions,
            $responses,
            $this->createMock(ProposalViewerIsAnEvaluerResolver::class),
            $this->createMock(AuthorizationCheckerInterface::class),
            $this->createMock(TokenGenerator::class),
            $helper
        );
        $context = new \ArrayObject();
        self::assertSame([$public, $private], $resolver($proposal, null, $context, 'author'));
        foreach ([null, '', 'other', 'invalid'] as $token) {
            self::assertSame([$public], $resolver($proposal, null, $context, $token));
        }
    }
}
