<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Adapter\RedisAdapter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use TweedeGolf\PrometheusClient\CollectorRegistry;
use TweedeGolf\PrometheusClient\Format\TextFormatter;

class MetricsController extends Controller
{
    /**
     * @Route("/metrics", name="capco_metrics")
     */
    public function metricsAction(): Response
    {
        $registry = new CollectorRegistry(new RedisAdapter($this->get('snc_redis.default')));
        $registry->createCounter('requests', [], null, CollectorRegistry::DEFAULT_STORAGE, true);
        $registry->getCounter('requests')->inc();
        $formatter = new TextFormatter();

        return new Response($formatter->format($registry->collect()), 200, [
            'Content-Type' => $formatter->getMimeType(),
        ]);
    }
}
