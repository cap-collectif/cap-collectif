<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Symfony\Component\Validator\Constraints\True;

class OpinionVersionType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', null, ['required' => true])
            ->add('body', null, ['required' => true])
            ->add('comment', null, ['required' => true])
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Capco\AppBundle\Entity\OpinionVersion',
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle',
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return '';
    }
}
