<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Steps\SelectionStep;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class SelectionStepNormalizer implements NormalizerInterface, SerializerAwareInterface
{
    use SerializerAwareTrait;
    private $router;
    private $normalizer;

    public function __construct(UrlGeneratorInterface $router, ObjectNormalizer $normalizer)
    {
        $this->router = $router;
        $this->normalizer = $normalizer;
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
                $counters['votes'] = $object->getVotesCount();
                $counters['voters'] = $object->getContributorsCount();
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
