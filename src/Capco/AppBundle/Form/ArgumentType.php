<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Symfony\Component\Validator\Constraints\True;

class ArgumentType extends AbstractType
{
    protected $action;

    public function __construct($action)
    {
        $this->action = $action;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if ($this->action === 'edit') {
            $builder
                ->add('confirm', 'checkbox', [
                    'mapped'             => false,
                    'label'              => 'argument.form.confirm',
                    'required'           => true,
                    'translation_domain' => 'CapcoAppBundle',
                    'constraints'        => [new True(['message' => 'argument.votes_not_confirmed'])],
                ])
            ;
        }

        $builder
            ->add('body', 'textarea', [
                'required'           => true,
                'label'              => 'argument.form.body',
                'translation_domain' => 'CapcoAppBundle',
                'attr'               => ['rows' => 7],
            ])
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults([
            'data_class'      => 'Capco\AppBundle\Entity\Argument',
            'csrf_protection' => true,
            'csrf_field_name' => '_token',
        ]);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_app_argument';
    }
}
