<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\OpinionVote;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class OpinionVoteType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('value', 'choice', array(
                'choices' => OpinionVote::$voteTypesLabels,
                'translation_domain' => 'CapcoAppBundle',
                'multiple' => false,
                'expanded' => true,
                'attr' => array('onchange' => "document.getElementById('opinion_vote_form').submit()")
            ))
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Capco\AppBundle\Entity\OpinionVote',
            'csrf_protection' => true,
            'csrf_field_name' => '_token'
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_app_opinion_vote';
    }
}
