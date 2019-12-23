<?php

namespace Capco\AppBundle\Form\Step;

use Capco\AppBundle\Entity\Steps\RankingStep;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class RankingStepFormType extends AbstractStepFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);
        $builder->add('nbOpinionsToDisplay')->add('nbVersionsToDisplay');
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => RankingStep::class
        ]);
    }
}
