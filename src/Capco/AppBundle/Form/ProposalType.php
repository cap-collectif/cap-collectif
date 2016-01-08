<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Form\DataTransformer\EntityToIdTransformer;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class ProposalType extends AbstractType
{
    protected $transformer;
    protected $toggleManager;

    public function __construct(EntityToIdTransformer $transformer, Manager $toggleManager)
    {
        $this->transformer = $transformer;
        $this->toggleManager = $toggleManager;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', null, [
                'required' => true,
            ])
            ->add('body', null, [
                'required' => true,
            ])
        ;

        if ($this->toggleManager->isActive('themes')) {
            $builder
                ->add('theme', null, [
                    'required' => true,
                ])
            ;
        }

        $builder
            ->add('district', null, [
                'required' => true,
            ])
            ->add('proposalResponses', 'collection', [
                'allow_add' => true,
                'allow_delete' => false,
                'by_reference' => false,
                'type' => new ProposalResponseType($this->transformer),
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
            'cascade_validation' => true,
        ]);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'proposal';
    }
}
