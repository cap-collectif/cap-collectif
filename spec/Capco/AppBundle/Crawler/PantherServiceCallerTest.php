<?php

namespace spec\Capco\AppBundle\Crawler;

use Capco\AppBundle\Crawler\PantherServiceCaller;
use Capco\AppBundle\Entity\Debate\DebateArticle;
use PhpSpec\ObjectBehavior;

class PantherServiceCallerTest extends ObjectBehavior
{
    public function let()
    {
        $this->beConstructedWith('www.panther-test.com', 'test-token');
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(PantherServiceCaller::class);
    }

    public function it_should_complete_article(DebateArticle $article)
    {
        $testUrl = 'www.vraies-infos.com/la-terre-est-plate';
        $testTitle = 'Le chef de la NASA avoue avoir menti, la Terre est plate';
        $testDate = '2021-03-19 22:49:44.000000';
        $testName = 'VRAIES INFOS';
        $testImage =
            'https://lvdneng.rosselcdn.net/sites/default/files/dpistyles_v2/ena_16_9_extra_big/2020/02/27/node_716539/45527403/public/2020/02/27/B9722732949Z.1_20200227140346_000%2BGRDFJUP0Q.2-0.jpg';
        $testDescription = 'Mais évidemment, cette info est cachée par tout le monde.';
        $article
            ->getUrl()
            ->shouldBeCalled()
            ->willReturn($testUrl);

        file_get_contents(
            'www.panther-test.com?capco-token=test-token&url=' . $testUrl
        )->willReturn(
            json_encode([
                'url' => $testUrl,
                'title' => $testTitle,
                'publishedAt' => ['date' => $testDate],
                'crawledAt' => ['date' => $testDate],
                'name' => $testName,
                'image' => $testImage,
                'description' => $testDescription,
            ])
        );

        $this->completeArticle($article);
        $article->getTitle()->shouldReturn($testTitle);
        $article->getOrigin()->shouldReturn($testName);
        $article->getDescription()->shouldReturn($testDescription);
    }

    public function it_should_handle_incomplete_information(DebateArticle $article)
    {
        $testUrl = 'www.vraies-infos.com/la-terre-est-plate';
        $testTitle = 'Le chef de la NASA avoue avoir menti, la Terre est plate';
        $testName = 'VRAIES INFOS';
        $article
            ->getUrl()
            ->shouldBeCalled()
            ->willReturn($testUrl);

        file_get_contents(
            'www.panther-test.com?capco-token=test-token&url=' . $testUrl
        )->willReturn(
            json_encode([
                'url' => $testUrl,
                'title' => $testTitle,
                'name' => $testName,
            ])
        );

        $this->completeArticle($article);
        $article->getTitle()->shouldReturn($testTitle);
        $article->getOrigin()->shouldReturn($testName);
        $article->getDescription()->shouldReturn(null);
    }

    public function it_throws_exception_on_error(DebateArticle $article)
    {
        $testUrl = 'www.vraies-infos.com/la-terre-est-plate';
        $testError = 'nope';
        $article
            ->getUrl()
            ->shouldBeCalled()
            ->willReturn($testUrl);

        file_get_contents(
            'www.panther-test.com?capco-token=test-token&url=' . $testUrl
        )->willReturn(
            json_encode([
                'error' => $testError,
            ])
        );

        $this->shouldThrow(new \Exception('panther error : ' . $testError));

        $this->completeArticle($article);
    }
}
