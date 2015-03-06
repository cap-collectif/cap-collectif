<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Theme;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\Toggle\Manager;

class IdeaType extends AbstractType
{
    private $toggleManager;

    function __construct(Manager $toggleManager)
    {
        $this->toggleManager = $toggleManager;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', 'text', array(
                'label' => 'idea.form.title',
            ))
            ->add('body', 'ckeditor', array(
                'label' => 'idea.form.body',
                'config_name' => 'user_editor',
            ))
            ->add('media', 'sonata_media_type', array(
                'label' => 'idea.form.media',
                'provider' => 'sonata.media.provider.image',
                'context' => 'default',
                'required' => false,
            ))
        ;

        if ($this->toggleManager->isActive('themes')) {
            $builder->add('Theme', 'entity', array(
                'label' => 'idea.form.theme',
                'class' => 'CapcoAppBundle:Theme',
                'property' => 'title',
                'multiple' => false,
                'expanded' => false,
                'query_builder' => function (ThemeRepository $tr) {
                    return $tr->createQueryBuilder('t')
                        ->where('t.isEnabled = :enabled')
                        ->setParameter('enabled', true);
                }
            ));
        }
    }
    
    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Capco\AppBundle\Entity\Idea',
            'csrf_protection' => true,
            'csrf_field_name' => '_token',
            'translation_domain' => 'CapcoAppBundle',
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_appbundle_idea';
    }
}
