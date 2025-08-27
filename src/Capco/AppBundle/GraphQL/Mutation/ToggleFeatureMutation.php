<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Form\ApiToggleType;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Toggle\Manager;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ToggleFeatureMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly Manager $toggleManager, private readonly FormFactoryInterface $formFactory)
    {
    }

    public function __invoke(Argument $args)
    {
        $this->formatInput($args);

        $feature = $args->offsetGet('type');
        $enabled = $args->offsetGet('enabled');
        unset($args['type']);
        $data = $args->getArrayCopy();

        // todo remove this check, it's useless https://github.com/cap-collectif/platform/issues/18474
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
