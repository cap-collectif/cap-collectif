<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Form\DataTransformer\EntityToIdTransformer;
use Doctrine\ORM\EntityManager;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class ProposalResponseType extends AbstractType
{
    protected $em;

    public function __construct(EntityManager $em)
    {
        $this->em = $em;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $dataTransformer = new EntityToIdTransformer($this->em);
        $dataTransformer->setEntityClass('Capco\AppBundle\Entity\Question');
        $dataTransformer->setEntityRepository('CapcoAppBundle:Question');
        $builder
            ->add('value', null, [
                'required' => true,
            ])
            ->add('question', 'hidden')
        ;
        $builder
            ->get('question')
            ->addModelTransformer($dataTransformer)
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults([
            'data_class'         => 'Capco\AppBundle\Entity\ProposalResponse',
            'csrf_protection'    => false,
            'translation_domain' => 'CapcoAppBundle',
            'cascade_validation' => true,
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
