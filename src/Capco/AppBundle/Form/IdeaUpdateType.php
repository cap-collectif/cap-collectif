<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints\True;

class IdeaUpdateType extends IdeaType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('confirm', 'checkbox', array(
                'mapped' => false,
                'label' => 'idea.form.confirm',
                'required' => true,
                'constraints' => [new True(['message' => 'idea.votes_not_confirmed'])]
            ))
        ;

        parent::buildForm($builder, $options);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_appbundle_ideaupdatetype';
    }
}
