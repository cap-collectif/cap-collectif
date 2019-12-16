<?php

namespace Capco\AppBundle\Form\Step;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Form\Type\RelayNodeType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ConsultationStepFormType extends AbstractStepFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        parent::buildForm($builder, $options);
        $builder->add('consultations', RelayNodeType::class, [
            'by_reference' => false,
            'multiple' => true,
            'class' => Consultation::class,
            'choice_label' => 'id'
        ]);
        $builder->addEventListener(FormEvents::SUBMIT, static function (FormEvent $event) {
            $normalizedConsultations = $event
                ->getForm()
                ->get('consultations')
                ->getNormData();
            /** @var ConsultationStep $step */
            $step = $event->getData();
            $position = 1;
            foreach ($normalizedConsultations as $normalizedConsultation) {
                // And we set in the backend the correct position for the consultation, based on the user order
                $consultation = $step
                    ->getConsultations()
                    ->filter(static function (Consultation $c) use ($normalizedConsultation) {
                        return $c->getId() === $normalizedConsultation->getId();
                    })
                    ->first();
                /** @var Consultation $consultation */
                if ($consultation) {
                    $consultation->setPosition($position);
                }
                ++$position;
            }
        });
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => ConsultationStep::class
        ]);
    }
}
