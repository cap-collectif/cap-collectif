<?php

namespace Capco\AppBundle\Form\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Form\RequirementType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolver;

abstract class AbstractStepType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('type', null, [
                'mapped' => false
            ])
            ->add('title')
            ->add('label')
            ->add('isEnabled')
            ->add('requirementsReason')
            ->add('requirements', CollectionType::class, [
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
                'entry_type' => RequirementType::class,
                'delete_empty' => true
            ]);
        $builder
            ->addEventListener(FormEvents::SUBMIT, static function (FormEvent $event) {
                /** @var AbstractStep $step */
                $step = $event->getData();
                $position = 0;
                foreach ($step->getRequirements() as $requirement) {
                    $requirement->setPosition(++$position);
                }
            });
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => AbstractStep::class
        ]);
    }
}
