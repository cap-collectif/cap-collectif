<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Form\DataTransformer\EntityToIdTransformer;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class ProposalResponseType extends AbstractType
{
    protected $transformer;

    public function __construct(EntityToIdTransformer $transformer)
    {
        $this->transformer = $transformer;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $this->transformer->setEntityClass('Capco\AppBundle\Entity\Question');
        $this->transformer->setEntityRepository('CapcoAppBundle:Question');
        $builder
            ->add('value', null, [
                'required' => true,
            ])
            ->add('question', 'hidden')
        ;
        $builder
            ->get('question')
            ->addModelTransformer($this->transformer)
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'Capco\AppBundle\Entity\ProposalResponse',
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
        return 'proposal_response';
    }
}
