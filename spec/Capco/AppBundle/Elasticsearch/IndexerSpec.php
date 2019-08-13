<?php

namespace spec\Capco\AppBundle\Elasticsearch;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\PostComment;
use Capco\AppBundle\Entity\ProposalComment;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Mapping\ClassMetadata;
use Elastica\Index;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Symfony\Bridge\Doctrine\RegistryInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Doctrine\Common\Persistence\Mapping\ClassMetadataFactory;

class IndexerSpec extends ObjectBehavior
{
    public function let(
        RegistryInterface $registry,
        SerializerInterface $serializer,
        Index $index,
        LoggerInterface $logger,
        EntityManagerInterface $em,
        ClassMetadataFactory $factory
    ): void {
        $registry->getManager()->willReturn($em);
        $em->getMetadataFactory()->willReturn($factory);
        $factory
            ->getAllMetadata()
            ->willReturn([
                new ClassMetadata(ProposalComment::class),
                new ClassMetadata(EventComment::class),
                new ClassMetadata(PostComment::class)
            ]);

        $this->beConstructedWith($registry, $serializer, $index, $logger);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(Indexer::class);
    }

    public function it_remove_proposal_comment()
    {
        $this->remove(ProposalComment::class, 'proposalComment3');
        $this->__get('currentDeleteBulk')->shouldHaveCount(1);
        $document = $this->__get('currentDeleteBulk')[0];
        $document->getId()->shouldBe('proposalComment3');
        $document->getType()->shouldBe('comment');
    }

    public function it_remove_event_comment()
    {
        $this->remove(EventComment::class, 'eventComment2');
        $this->__get('currentDeleteBulk')->shouldHaveCount(1);
        $document = $this->__get('currentDeleteBulk')[0];
        $document->getId()->shouldBe('eventComment2');
        $document->getType()->shouldBe('comment');
    }

    public function it_remove_post_comment()
    {
        $this->remove(PostComment::class, 'postComment1');
        $this->__get('currentDeleteBulk')->shouldHaveCount(1);
        $document = $this->__get('currentDeleteBulk')[0];
        $document->getId()->shouldBe('postComment1');
        $document->getType()->shouldBe('comment');
    }
}
