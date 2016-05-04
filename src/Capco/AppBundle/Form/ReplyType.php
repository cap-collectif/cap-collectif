<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Form\DataTransformer\EntityToIdTransformer;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class ReplyType extends AbstractType
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
            ->add('responses', 'collection', [
                'allow_add' => true,
                'allow_delete' => false,
                'by_reference' => false,
                'type' => new ResponseType($this->transformer, $this->questionRepository),
                'required' => false,
            ])
        ;

        if ($options['anonymousAllowed']) {
            $builder
                ->add('private', null, [
                    'required' => false,
                ])
            ;
        }
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'Capco\AppBundle\Entity\Reply',
            'csrf_protection' => false,
            'cascade_validation' => true,
            'anonymousAllowed' => false,
        ]);
    }

    public function getName()
    {
        return 'reply';
    }
}
