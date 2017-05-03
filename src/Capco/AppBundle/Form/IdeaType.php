<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Form\Type\PurifiedTextareaType;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\UrlType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class IdeaType extends AbstractType
{
    private $toggleManager;

    public function __construct(Manager $toggleManager)
    {
        $this->toggleManager = $toggleManager;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title',
                PurifiedTextType::class, [
                'required' => true,
            ])
        ;

        if ($this->toggleManager->isActive('themes')) {
            $builder->add('theme', null, [
                'required' => true,
            ]);
        }

        $builder
            ->add('body',
                PurifiedTextareaType::class, [
                'required' => true,
            ])
            ->add('object', null, [
                'required' => true,
            ])
            ->add('url',
                UrlType::class, [
                'required' => false,
                'default_protocol' => 'http',
            ])
            ->add('media', 'sonata_media_type', [
                'required' => false,
                'provider' => 'sonata.media.provider.image',
                'context' => 'default',
            ])
            ->add('delete_media',
                CheckboxType::class, [
                'required' => false,
                'mapped' => false,
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'Capco\AppBundle\Entity\Idea',
            'csrf_protection' => false,
            'cascade_validation' => true,
        ]);
    }
}
