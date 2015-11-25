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
            ->add('title', 'text', [
                'label' => 'idea.form.title',
            ])
        ;

        if ($this->toggleManager->isActive('themes')) {
            $builder->add('theme', null, [
                'label'         => 'idea.form.theme',
                'required'      => true,
                'empty_value'   => 'idea.form.empty_theme',
                'query_builder' => function (ThemeRepository $tr) {
                    return $tr->createQueryBuilder('t')
                        ->where('t.isEnabled = :enabled')
                        ->setParameter('enabled', true);
                },
            ]);
        }

        $builder
            ->add('body', 'ckeditor', [
                'label'       => 'idea.form.body',
                'config_name' => 'user_editor',
            ])
            ->add('object', 'ckeditor', [
                'label'       => 'idea.form.object',
                'config_name' => 'user_editor',
            ])
            ->add('url', 'url', [
                'label'            => 'idea.form.url',
                'required'         => false,
                'default_protocol' => 'http',
                'help'             => 'idea.form.url_help',
                'attr'             => [
                    'placeholder' => 'http://',
                ],
            ])
            ->add('media', 'sonata_media_type', [
                'label'    => 'idea.form.media',
                'provider' => 'sonata.media.provider.image',
                'context'  => 'default',
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
            'data_class'         => 'Capco\AppBundle\Entity\Idea',
            'csrf_protection'    => true,
            'csrf_field_name'    => '_token',
            'translation_domain' => 'CapcoAppBundle',
        ]);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_appbundle_idea';
    }
}
