<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Repository\AbstractVoteRepository;
use Capco\AppBundle\Resolver\OpinionTypesResolver;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class OpinionNormalizer implements NormalizerInterface, SerializerAwareInterface
{
    use SerializerAwareTrait;
    private $router;
    private $normalizer;
    private $resolver;
    private $toggleManager;
    private $tokenStorage;
    private $voteRepository;

    public function __construct(
        UrlGeneratorInterface $router,
        ObjectNormalizer $normalizer,
        OpinionTypesResolver $resolver,
        TokenStorageInterface $tokenStorage,
        AbstractVoteRepository $voteRepository,
        Manager $toggleManager
    ) {
        $this->router = $router;
        $this->normalizer = $normalizer;
        $this->resolver = $resolver;
        $this->tokenStorage = $tokenStorage;
        $this->voteRepository = $voteRepository;
        $this->toggleManager = $toggleManager;
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $groups =
            isset($context['groups']) && \is_array($context['groups']) ? $context['groups'] : [];
        $data = $this->normalizer->normalize($object, $format, $context);

        $opinionType = $object->getOpinionType();
        $step = $object->getStep();
        $project = $step && $step->getProjectAbstractStep()
            ? $step->getProjectAbstractStep()->getProject()
            : null;
        $token = $this->tokenStorage->getToken();
        $user = $token ? $token->getUser() : 'anon.';
        if ($project) {
            $showUrl = $object->getSlug()
                ? $this->router->generate(
                    'app_project_show_opinion',
                    [
                        'projectSlug' => $project->getSlug(),
                        'stepSlug' => $step->getSlug(),
                        'opinionTypeSlug' => $opinionType->getSlug(),
                        'opinionSlug' => $object->getSlug()
                    ],
                    true
                )
                : null;
            $data['_links'] = [
                'show' => $showUrl,
                'type' => $this->router->generate(
                    'app_project_show_opinions',
                    [
                        'projectSlug' => $project->getSlug(),
                        'stepSlug' => $step->getSlug(),
                        'consultationSlug' => $opinionType->getConsultation()->getSlug(),
                        'opinionTypeSlug' => $opinionType->getSlug()
                    ],
                    true
                )
            ];
        }
        $data['userVote'] =
            'anon.' === $user
                ? null
                : $this->voteRepository->getByObjectUser('opinion', $object, $user);
        $data['hasUserReported'] = 'anon.' === $user ? false : $object->userHasReport($user);
        if (\in_array('Opinions', $groups) && $this->toggleManager->isActive('votes_evolution')) {
            $data['history'] = [
                'votes' => $this->voteRepository->getHistoryFor('opinion', $object)
            ];
        }

        return $data;
    }

    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof Opinion;
    }
}
