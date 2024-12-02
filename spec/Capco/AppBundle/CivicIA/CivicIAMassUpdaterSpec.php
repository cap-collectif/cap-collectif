<?php

namespace spec\Capco\AppBundle\CivicIA;

use Capco\AppBundle\CivicIA\CivicIAMassUpdater;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class CivicIAMassUpdaterSpec extends ObjectBehavior
{
    public function let(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $entityManager,
        Indexer $indexer
    ) {
        $this->beConstructedWith($globalIdResolver, $entityManager, $indexer);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(CivicIAMassUpdater::class);
    }

    public function it_should_update_one(ValueResponse $valueResponse): void
    {
        $category = 'cars';
        $readability = random_int(1, 100);
        $sentiment = 'NEUTRAL';

        $valueResponse->setIaSentiment($sentiment)->shouldBeCalledOnce();
        $valueResponse->setIaReadability($readability)->shouldBeCalledOnce();
        $valueResponse->setIaCategory($category)->shouldBeCalledOnce();

        $this->updateOne($valueResponse, $category, $readability, $sentiment);
    }

    public function it_should_fail_if_invalid_json(User $viewer): void
    {
        $invalidJson = '{"key": "value"}';
        $this->shouldThrow(new UserError('INVALID_JSON'))->during('__invoke', [
            $invalidJson,
            $viewer,
        ]);
    }

    public function it_should_fail_if_missing_id(User $viewer): void
    {
        $invalidJson = json_encode([
            [
                'categories' => 'car',
                'sentiment' => 'NEUTRAL',
                'lisibilite' => random_int(1, 100),
            ],
        ]);
        $this->shouldThrow(new UserError('INVALID_JSON'))->during('__invoke', [
            $invalidJson,
            $viewer,
        ]);
    }

    public function it_should_fail_if_analyzable_not_found(User $viewer): void
    {
        $json = json_encode([
            [
                'value_id' => 'nope',
                'categories' => 'car',
                'sentiment' => 'NEUTRAL',
                'lisibilite' => random_int(1, 100),
            ],
        ]);
        $this->shouldThrow(new UserError('NOT_FOUND'))->during('__invoke', [$json, $viewer]);
    }

    public function it_should_update_analyzable(
        ValueResponse $response1,
        ValueResponse $response2,
        User $viewer,
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $entityManager,
        Indexer $indexer
    ): void {
        $globalIdResolver
            ->resolve('response1', $viewer)
            ->shouldBeCalledOnce()
            ->willReturn($response1)
        ;
        $globalIdResolver
            ->resolve('response2', $viewer)
            ->shouldBeCalledOnce()
            ->willReturn($response2)
        ;
        $entityManager->flush()->shouldBeCalledOnce();
        $indexer->index(Argument::any(), Argument::any())->shouldBeCalled();
        $indexer->finishBulk()->shouldBeCalled();

        $jsonData = [
            [
                'value_id' => 'response1',
                'categories' => 'car',
                'sentiment' => 'NEUTRAL',
                'lisibilite' => random_int(1, 100),
                'categories_details' => [
                    ['score' => 0.834992, 'label' => 'news'],
                    ['score' => 0.92, 'label' => 'car'],
                ],
            ],
            [
                'value_id' => 'response2',
                'categories' => 'holiday',
                'sentiment' => 'POSITIVE',
                'lisibilite' => random_int(1, 100),
                'sentiment_score' => [
                    'Positive' => 0.9745733738,
                    'Negative' => 0.0064354725,
                    'Neutral' => 0.0064354725,
                    'Mixed' => 0.0000347175,
                ],
            ],
        ];

        $response1->getId()->shouldBeCalled()->willReturn('response1');
        $response1->setIaCategory($jsonData[0]['categories'])->shouldBeCalledOnce();
        $response1->setIaReadability($jsonData[0]['lisibilite'])->shouldBeCalledOnce();
        $response1->setIaSentiment($jsonData[0]['sentiment'])->shouldBeCalledOnce();
        $response1
            ->setIaCategoryDetails(json_encode($jsonData[0]['categories_details']))
            ->shouldBeCalledOnce()
        ;
        $response1->setIaSentimentDetails(Argument::any())->shouldNotBeCalled();

        $response2->getId()->shouldBeCalled()->willReturn('response2');
        $response2->setIaCategory($jsonData[1]['categories'])->shouldBeCalledOnce();
        $response2->setIaReadability($jsonData[1]['lisibilite'])->shouldBeCalledOnce();
        $response2->setIaSentiment($jsonData[1]['sentiment'])->shouldBeCalledOnce();
        $response2->setIaCategoryDetails(Argument::any())->shouldNotBeCalled();
        $response2
            ->setIaSentimentDetails(json_encode($jsonData[1]['sentiment_score']))
            ->shouldBeCalledOnce()
        ;

        $this->__invoke(json_encode($jsonData), $viewer);
    }
}
