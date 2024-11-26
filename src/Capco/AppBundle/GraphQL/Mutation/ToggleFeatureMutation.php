<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Form\ApiToggleType;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ToggleFeatureMutation implements MutationInterface
{
    use MutationTrait;
    private readonly Manager $toggleManager;
    private readonly FormFactoryInterface $formFactory;

    public function __construct(Manager $toggleManager, FormFactoryInterface $formFactory)
    {
        $this->toggleManager = $toggleManager;
        $this->formFactory = $formFactory;
    }

    public function __invoke(Argument $args, User $viewer)
    {
        $this->formatInput($args);
        if (!$viewer || !$viewer->isAdmin()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        $feature = $args->offsetGet('type');
        $enabled = $args->offsetGet('enabled');
        unset($args['type']);
        $data = $args->getArrayCopy();

        if (!$this->toggleManager->exists($feature)) {
            throw new NotFoundHttpException(sprintf('The feature "%s" doesn\'t exists.', $feature));
        }

        $form = $this->formFactory->create(ApiToggleType::class);
        $form->submit($data, false);

        if (!$form->isValid()) {
            return $form;
        }

        if ($form->getData()['enabled']) {
            $this->toggleManager->activate($feature);
        } else {
            $this->toggleManager->deactivate($feature);
        }

        return [
            'featureFlag' => [
                'type' => $feature,
                'enabled' => $enabled,
            ],
        ];
    }
}
