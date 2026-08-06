<?php

namespace Capco\AppBundle\Form\Step;

use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Form\HubMetadataType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\NotNull;
use Symfony\Component\Validator\Constraints\Valid;

class OtherStepFormType extends AbstractStepFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        parent::buildForm($builder, $options);
        $hubMetadataConstraints = [new Valid()];
        if ($options['hub_metadata_required']) {
            array_unshift($hubMetadataConstraints, new NotNull());
        }

        $builder->add('hubMetadata', HubMetadataType::class, [
            'required' => $options['hub_metadata_required'],
            'hub_metadata_required' => $options['hub_metadata_required'],
            'constraints' => $hubMetadataConstraints,
        ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => OtherStep::class,
            'hub_metadata_required' => false,
        ]);
        $resolver->setAllowedTypes('hub_metadata_required', 'bool');
    }
}
