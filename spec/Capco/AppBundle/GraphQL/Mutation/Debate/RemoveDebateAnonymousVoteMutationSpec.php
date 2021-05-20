<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\DTO\DebateAnonymousParticipationHashData;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Encoder\DebateAnonymousParticipationHashEncoder;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateAnonymousVote;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\GraphQL\Mutation\Debate\RemoveDebateAnonymousVoteMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\Debate\DebateAnonymousVoteRepository;
use Capco\AppBundle\Validator\Constraints\CheckDebateAnonymousParticipationHashConstraint;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class RemoveDebateAnonymousVoteMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        LoggerInterface $logger,
        DebateAnonymousVoteRepository $repository,
        ValidatorInterface $validator,
        DebateAnonymousParticipationHashEncoder $encoder,
        GlobalIdResolver $globalIdResolver,
        Indexer $indexer
    ) {
        $this->beConstructedWith(
            $em,
            $logger,
            $repository,
            $validator,
            $encoder,
            $globalIdResolver,
            $indexer
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(RemoveDebateAnonymousVoteMutation::class);
    }

    public function it_delete_a_vote_when_open_and_with_a_valid_hash(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        DebateStep $debateStep,
        DebateAnonymousVote $anonymousVote,
        DebateAnonymousVoteRepository $repository,
        Debate $debate,
        DebateAnonymousParticipationHashEncoder $encoder,
        DebateAnonymousParticipationHashData $decoded,
        ValidatorInterface $validator
    ) {
        $id = '123';
        $token = 'jesuisunsupertokengenshinimpact1';
        $type = 'AGAINST';
        // AGAINST:jesuisunsupertokengenshinimpact1
        $hash = 'QUdBSU5TVDpqZXN1aXN1bnN1cGVydG9rZW5nZW5zaGluaW1wYWN0MQ==';

        $input->offsetGet('debateId')->willReturn($id);
        $input->offsetGet('hash')->willReturn($hash);
        $decoded->getType()->willReturn($type);
        $decoded->getToken()->willReturn($token);
        $encoder->decode($hash)->willReturn($decoded);
        $debateStep->isOpen()->willReturn(true);
        $debate->getId()->willReturn($id);
        $debate->getStep()->willReturn($debateStep);
        $anonymousVote->getDebate()->willReturn($debate);
        $anonymousVote->getId()->willReturn($id);
        $anonymousVote->getToken()->willReturn($token);
        $anonymousVote->getType()->willReturn($type);
        $repository
            ->findOneBy([
                'token' => $decoded->getWrappedObject()->getToken(),
                'type' => $decoded->getWrappedObject()->getType(),
            ])
            ->willReturn($anonymousVote);

        $globalIdResolver
            ->resolve($id, null)
            ->willReturn($debate)
            ->shouldBeCalled();
        $validator
            ->validate($hash, [new CheckDebateAnonymousParticipationHashConstraint()])
            ->willReturn([])
            ->shouldBeCalled();
        $em->remove($anonymousVote)->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(3);
        $payload['errorCode']->shouldBe(null);
        $payload['debate']->shouldBe($debate);
        $payload['deletedDebateAnonymousVoteId']->shouldBe('RGViYXRlQW5vbnltb3VzVm90ZToxMjM=');
    }

    public function it_errors_on_invalid_id(GlobalIdResolver $globalIdResolver, Arg $input)
    {
        $id = '123';
        $input->offsetGet('debateId')->willReturn($id);
        $globalIdResolver->resolve($id, null)->willReturn(null);

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(3);
        $payload['errorCode']->shouldBe('UNKNOWN_DEBATE');
        $payload['debate']->shouldBe(null);
        $payload['deletedDebateAnonymousVoteId']->shouldBe(null);
    }

    public function it_errors_if_not_voted(
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        Debate $debate,
        DebateStep $debateStep,
        DebateAnonymousVoteRepository $repository,
        DebateAnonymousParticipationHashEncoder $encoder,
        DebateAnonymousParticipationHashData $decoded,
        ValidatorInterface $validator
    ) {
        $id = '123';
        $type = 'AGAINST';
        $token = 'jesuisunsupertokengenshinimpact1';
        // AGAINST:jesuisunsupertokengenshinimpact1
        $hash = 'QUdBSU5TVDpqZXN1aXN1bnN1cGVydG9rZW5nZW5zaGluaW1wYWN0MQ==';
        $input->offsetGet('debateId')->willReturn($id);
        $input->offsetGet('hash')->willReturn($hash);
        $decoded->getType()->willReturn($type);
        $decoded->getToken()->willReturn($token);
        $encoder->decode($hash)->willReturn($decoded);
        $debateStep->isOpen()->willReturn(true);
        $debate->getStep()->willReturn($debateStep);
        $globalIdResolver->resolve($id, null)->willReturn($debate);
        $validator
            ->validate($hash, [new CheckDebateAnonymousParticipationHashConstraint()])
            ->willReturn([])
            ->shouldBeCalled();
        $repository
            ->findOneBy([
                'token' => $decoded->getWrappedObject()->getToken(),
                'type' => $decoded->getWrappedObject()->getType(),
            ])
            ->willReturn(null);

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(3);
        $payload['errorCode']->shouldBe('NOT_VOTED');
        $payload['debate']->shouldBe(null);
        $payload['deletedDebateAnonymousVoteId']->shouldBe(null);
    }

    public function it_errors_if_invalid_hash(
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        Debate $debate,
        DebateStep $debateStep,
        DebateAnonymousVoteRepository $repository,
        DebateAnonymousParticipationHashEncoder $encoder,
        DebateAnonymousParticipationHashData $decoded,
        ValidatorInterface $validator
    ) {
        $id = '123';
        $type = 'AGAINST';
        $token = 'jesuisunsupertokengenshinimpact1';
        // YOLO:jesuisunsupertokengenshinimpact1
        $hash = 'WU9MTzpqZXN1aXN1bnN1cGVydG9rZW5nZW5zaGluaW1wYWN0MQ==';
        $input->offsetGet('debateId')->willReturn($id);
        $input->offsetGet('hash')->willReturn($hash);
        $decoded->getType()->willReturn($type);
        $decoded->getToken()->willReturn($token);
        $encoder->decode($hash)->willReturn($decoded);
        $debateStep->isOpen()->willReturn(true);
        $debate->getStep()->willReturn($debateStep);
        $globalIdResolver->resolve($id, null)->willReturn($debate);
        $validator
            ->validate($hash, [new CheckDebateAnonymousParticipationHashConstraint()])
            ->willReturn(['invalid-debate-anonymous-hash'])
            ->shouldBeCalled();
        $repository
            ->findOneBy([
                'token' => $decoded->getWrappedObject()->getToken(),
                'type' => $decoded->getWrappedObject()->getType(),
            ])
            ->willReturn(null);

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(3);
        $payload['errorCode']->shouldBe('INVALID_HASH');
        $payload['debate']->shouldBe(null);
        $payload['deletedDebateAnonymousVoteId']->shouldBe(null);
    }

    public function it_errors_on_closed_debate(
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        DebateStep $debateStep,
        Debate $debate
    ) {
        $id = '123';
        $input->offsetGet('debateId')->willReturn($id);
        $debateStep->isOpen()->willReturn(false);
        $debate->getStep()->willReturn($debateStep);
        $globalIdResolver->resolve($id, null)->willReturn($debate);

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(3);
        $payload['errorCode']->shouldBe('CLOSED_DEBATE');
        $payload['debate']->shouldBe(null);
        $payload['deletedDebateAnonymousVoteId']->shouldBe(null);
    }
}
