<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\DataLoader\Step\StepVotesCountDataLoader;
use Capco\AppBundle\Search\UserSearch;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\CacheableSupportsMethodInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class SelectionStepNormalizer implements NormalizerInterface, SerializerAwareInterface, CacheableSupportsMethodInterface
{
    use SerializerAwareTrait;

    public function __construct(private UrlGeneratorInterface $router, private readonly ObjectNormalizer $normalizer, private StepVotesCountDataLoader $votesCountDataLoader, private readonly UserSearch $userSearch)
    {
    }

    public function hasCacheableSupportsMethod(): bool
    {
        return true;
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $groups =
            isset($context['groups']) && \is_array($context['groups']) ? $context['groups'] : [];
        $project = $object->getProject();
        $data = $this->normalizer->normalize($object, $format, $context);
        if (\in_array('Steps', $groups)) {
            $counters = [];
            $counters['proposals'] = \count($object->getProposals());

            if ($object->isVotable()) {
                $counters['votes'] = $this->votesCountDataLoader->resolve($object);
                $counters['voters'] = $this->userSearch
                    ->getContributorByStep($object, 0)
                    ->getTotalCount()
                ;
            }

            $remainingTime = $object->getRemainingTime();
            if ($remainingTime) {
                if ($object->isClosed()) {
                    $counters['remainingDays'] = $remainingTime['days'];
                } elseif ($object->isOpen()) {
                    if ($remainingTime['days'] > 0) {
                        $counters['remainingDays'] = $remainingTime['days'];
                    } else {
                        $counters['remainingHours'] = $remainingTime['hours'];
                    }
                }
            }
            $data['counters'] = $counters;
            if ($project) {
                $data['_links']['show'] = $this->router->generate(
                    'app_project_show_selection',
                    [
                        'projectSlug' => $project->getSlug(),
                        'stepSlug' => $object->getSlug(),
                    ],
                    true
                );
            }

            return $data;
        }

        return $data;
    }

    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof SelectionStep;
    }
}
