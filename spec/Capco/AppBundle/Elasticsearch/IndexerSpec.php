<?php

namespace spec\Capco\AppBundle\Elasticsearch;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\ArgumentVote;
use Capco\AppBundle\Entity\District\ProjectDistrict;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\OpinionVersionVote;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Entity\PostComment;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Entity\SourceVote;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Mapping\ClassMetadata;
use Elastica\Index;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Symfony\Bridge\Doctrine\RegistryInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Doctrine\Common\Persistence\Mapping\ClassMetadataFactory;
use Symfony\Component\Stopwatch\Stopwatch;

class IndexerSpec extends ObjectBehavior
{
    public function let(
        RegistryInterface $registry,
        SerializerInterface $serializer,
        Index $index,
        LoggerInterface $logger,
        EntityManagerInterface $em,
        ClassMetadataFactory $factory,
        Stopwatch $stopwatch
    ): void {
        $registry->getManager()->willReturn($em);
        $em->getMetadataFactory()->willReturn($factory);
        $factory
            ->getAllMetadata()
            ->willReturn([
                new ClassMetadata(ProposalComment::class),
                new ClassMetadata(EventComment::class),
                new ClassMetadata(PostComment::class),
                new ClassMetadata(ValueResponse::class),
                new ClassMetadata(MediaResponse::class),
                new ClassMetadata(ProjectDistrict::class),
                new ClassMetadata(AbstractVote::class),
                new ClassMetadata(ProposalSelectionVote::class),
                new ClassMetadata(ProposalCollectVote::class),
                new ClassMetadata(SourceVote::class),
                new ClassMetadata(ArgumentVote::class),
                new ClassMetadata(OpinionVote::class),
                new ClassMetadata(OpinionVersionVote::class),
            ]);

        $this->beConstructedWith($registry, $serializer, $index, $logger, $stopwatch);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(Indexer::class);
    }

    public function it_remove_proposal_comment()
    {
        $this->itShouldDeleteIndex(ProposalComment::class, 'proposalComment3', '_doc');
    }

    public function it_remove_event_comment()
    {
        $this->itShouldDeleteIndex(EventComment::class, 'eventComment2', '_doc');
    }

    public function it_remove_post_comment()
    {
        $this->itShouldDeleteIndex(PostComment::class, 'postComment1', '_doc');
    }

    public function it_remove_value_response()
    {
        $this->itShouldDeleteIndex(ValueResponse::class, 'valueResponse1', '_doc');
    }

    public function it_remove_media_response()
    {
        $this->itShouldDeleteIndex(MediaResponse::class, 'mediaResponse1', '_doc');
    }

    public function it_remove_project_district()
    {
        $this->itShouldDeleteIndex(ProjectDistrict::class, 'district1', '_doc');
    }

    public function it_remove_vote()
    {
        $this->itShouldDeleteIndex(AbstractVote::class, 'vote1', '_doc');
    }

    public function it_remove_proposal_selection_vote()
    {
        $this->itShouldDeleteIndex(ProposalSelectionVote::class, 'proposalSelectionVote1', '_doc');
    }

    public function it_remove_argument_vote()
    {
        $this->itShouldDeleteIndex(ArgumentVote::class, 'argumentVote1', '_doc');
    }

    public function it_remove_source_vote()
    {
        $this->itShouldDeleteIndex(SourceVote::class, 'sourceVote1', '_doc');
    }

    public function it_remove_opinion_vote()
    {
        $this->itShouldDeleteIndex(OpinionVote::class, 'opinionVote1', '_doc');
    }

    public function it_remove_opinion_version_vote()
    {
        $this->itShouldDeleteIndex(OpinionVersionVote::class, 'opinionVersionVote1', '_doc');
    }

    public function it_remove_proposal_collect_vote()
    {
        $this->itShouldDeleteIndex(ProposalCollectVote::class, 'proposalCollectVote1', '_doc');
    }

    private function itShouldDeleteIndex(string $class, string $id, string $type)
    {
        $this->remove($class, $id);
        $this->__get('currentDeleteBulk')->shouldHaveCount(1);
        $document = $this->__get('currentDeleteBulk')[0];
        $document
            ->getId()
            ->shouldBe(\call_user_func([$class, 'getElasticsearchTypeName']) . ':' . $id);
        $document->getType()->shouldBe($type);
    }
}
