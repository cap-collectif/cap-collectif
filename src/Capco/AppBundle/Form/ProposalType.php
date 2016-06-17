<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Form\DataTransformer\EntityToIdTransformer;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class ProposalType extends AbstractType
{
    protected $transformer;
    protected $toggleManager;
    protected $questionRepository;

    public function __construct(EntityToIdTransformer $transformer, Manager $toggleManager, AbstractQuestionRepository $questionRepository)
    {
        $this->transformer = $transformer;
        $this->toggleManager = $toggleManager;
        $this->questionRepository = $questionRepository;
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

        if ($this->toggleManager->isActive('districts')) {
            $builder
                ->add('district', null, [
                    'required' => true,
                ])
            ;
        }

        $builder
            ->add('responses', 'collection', [
                'allow_add' => true,
                'allow_delete' => false,
                'by_reference' => false,
                'type' => new ResponseType($this->transformer, $this->questionRepository),
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
