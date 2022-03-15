<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Debate;

use ArrayIterator;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateArticle;
use Capco\AppBundle\GraphQL\Resolver\Debate\DebateArticlesResolver;
use Capco\AppBundle\Repository\Debate\DebateArticleRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Overblog\GraphQLBundle\Definition\Argument;
use PhpSpec\ObjectBehavior;

class DebateArticlesResolverSpec extends ObjectBehavior
{
    public function let(DebateArticleRepository $repository)
    {
        $this->beConstructedWith($repository);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DebateArticlesResolver::class);
    }

    public function it_resolve_empty_connection(DebateArticleRepository $repository, Debate $debate)
    {
        $args = new Argument(['first' => 0, 'after' => null]);
        $repository
            ->countByDebate($debate)
            ->willReturn(0)
            ->shouldBeCalled();
        $this->__invoke($debate, $args)->shouldReturnEmptyConnection([]);
    }

    public function it_resolve_articles(
        DebateArticleRepository $repository,
        Debate $debate,
        Paginator $paginator,
        DebateArticle $a,
        DebateArticle $b
    ) {
        $args = new Argument(['first' => 10, 'after' => null]);
        $repository
            ->getByDebate($debate, 11, 0)
            ->willReturn($paginator)
            ->shouldBeCalled();
        $repository
            ->countByDebate($debate)
            ->willReturn(2)
            ->shouldBeCalled();
        $paginator->getIterator()->willReturn(new ArrayIterator([$a, $b]));
        $this->__invoke($debate, $args)->shouldReturnConnection();
    }
}
