<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\ProposalResponse;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class ProposalType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', null, [
                'required' => true
            ])
            ->add('body', null, [
                'required' => true
            ])
            ->add('theme', null, [
                'required' => true
            ])
            ->add('district', null, [
                'required' => true
            ])
            ->add('proposalResponses', 'collection', [
                'allow_add' => true,
                'allow_delete' => false,
                'by_reference' => false,
                'type' => new ProposalResponseType(),
                'required' => false,
            ])
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'Capco\AppBundle\Entity\Proposal',
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle',
        ]);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return '';
    }
}
