<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints\IsTrue;

class IdeaUpdateType extends IdeaType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('confirm',
                CheckboxType::class, [
                'mapped' => false,
                'label' => 'idea.form.confirm',
                'required' => true,
                'constraints' => [new IsTrue(['message' => 'idea.votes_not_confirmed'])],
            ])
        ;

        parent::buildForm($builder, $options);
    }
}
