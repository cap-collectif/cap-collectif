<?php

namespace Capco\AppBundle\Form\Step;

use Capco\AppBundle\Entity\Interfaces\ParticipativeStepInterface;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Form\RequirementType;
use Capco\AppBundle\Form\Type\OrderedCollectionType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

abstract class AbstractStepFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('type', null, [
                'mapped' => false
            ])
            ->add('body')
            ->add('title')
            ->add('label')
            ->add('isEnabled')
            ->add('requirementsReason')
            ->add('requirements', OrderedCollectionType::class, [
                'entry_type' => RequirementType::class,
                'on_update' => static function (
                    Requirement $itemFromDb,
                    Requirement $itemFromUser
                ) {
                    $itemFromDb
                        ->setLabel($itemFromUser->getLabel())
                        ->setType($itemFromUser->getType());
                }
            ]);
        if ($builder->getData() instanceof ParticipativeStepInterface) {
            $builder->add('timeless');
        }
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => AbstractStep::class
        ]);
    }
}
