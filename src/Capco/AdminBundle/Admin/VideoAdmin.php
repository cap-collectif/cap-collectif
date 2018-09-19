<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Video;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\CoreBundle\Model\Metadata;

class VideoAdmin extends AbstractAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    // For mosaic view
    public function getObjectMetadata($object)
    {
        $media = $object->getMedia();
        if ($media) {
            $provider = $this->getConfigurationPool()
                ->getContainer()
                ->get($media->getProviderName());
            $format = $provider->getFormatName($media, 'form');
            $url = $provider->generatePublicUrl($media, $format);

            return new Metadata($object->getTitle(), null, $url);
        }

        return parent::getObjectMetadata($object);
    }

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'admin.fields.video.title',
            ])
            ->add(
                'Author',
                'doctrine_orm_model_autocomplete',
                [
                    'label' => 'admin.fields.video.author',
                ],
                null,
                [
                    'property' => 'username',
                ]
            )
            ->add('isEnabled', null, [
                'label' => 'admin.fields.video.is_enabled',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.video.updated_at',
            ])
            ->add('position', null, [
                'label' => 'admin.fields.video.position',
            ])
            ->add('color', null, [
                'label' => 'admin.fields.video.color',
            ]);
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.video.title',
            ])
            ->add('Author', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.video.author',
                'property' => 'username',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.video.is_enabled',
                'editable' => true,
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.video.updated_at',
            ])
            ->add('color', null, [
                'label' => 'admin.fields.video.color',
                'template' => 'CapcoAdminBundle:OpinionType:color_list_field.html.twig',
                'typesColors' => Video::$colorButtonPlay,
            ])
            ->add('position', null, [
                'label' => 'admin.fields.video.position',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                    'edit' => [],
                    'delete' => [],
                ],
            ]);
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('title', null, [
                'label' => 'admin.fields.video.title',
            ])
            ->add('body', null, [
                'label' => 'admin.fields.video.body',
            ])
            ->add('Author', 'sonata_type_model', [
                'label' => 'admin.fields.video.author',
                'choices_as_values' => true,
                'required' => true,
            ])
            ->add('link', null, [
                'label' => 'admin.fields.video.link',
                'required' => true,
                'help' => 'admin.help.project.video',
                'attr' => [
                    'placeholder' => 'http://',
                ],
            ])
            ->add('position', null, [
                'label' => 'admin.fields.video.position',
            ])
            ->add('color', 'choice', [
                'label' => 'admin.fields.video.color',
                'choices' => array_flip(Video::$colorButtonPlay),
                'translation_domain' => 'CapcoAppBundle',
            ])
            ->add(
                'media',
                'sonata_type_model_list',
                [
                    'label' => 'admin.fields.video.media',
                    'required' => false,
                    'help' => 'admin.help.video.media',
                ],
                [
                    'link_parameters' => [
                        'context' => 'default',
                        'hide_context' => true,
                        'provider' => 'sonata.media.provider.image',
                    ],
                ]
            )
            ->add('isEnabled', null, [
                'label' => 'admin.fields.video.is_enabled',
                'required' => false,
            ]);
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, [
                'label' => 'admin.fields.video.title',
            ])
            ->add('body', null, [
                'label' => 'admin.fields.video.body',
            ])
            ->add('Author', null, [
                'label' => 'admin.fields.video.author',
            ])
            ->add('media', 'sonata_media_type', [
                'template' => 'CapcoAdminBundle:Event:media_show_field.html.twig',
                'provider' => 'sonata.media.provider.image',
                'label' => 'admin.fields.video.media',
            ])
            ->add('color', null, [
                'label' => 'admin.fields.video.color',
                'template' => 'CapcoAdminBundle:OpinionType:color_show_field.html.twig',
                'typesColors' => Video::$colorButtonPlay,
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.video.is_enabled',
                'editable' => true,
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.video.updated_at',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.video.created_at',
            ]);
    }
}
