<?php

namespace Capco\AdminBundle\Admin;

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
        '_sort_by' => 'title'
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

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'global.title'
            ])
            ->add(
                'Author',
                'doctrine_orm_model_autocomplete',
                [
                    'label' => 'global.author'
                ],
                null,
                [
                    'property' => 'email,username',
                    'to_string_callback' => function ($enitity, $property) {
                        return $enitity->getEmail() . ' - ' . $enitity->getUsername();
                    }
                ]
            )
            ->add('isEnabled', null, [
                'label' => 'global.published'
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj'
            ])
            ->add('position', null, [
                'label' => 'global.position'
            ]);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'global.title'
            ])
            ->add('Author', 'sonata_type_model_autocomplete', [
                'label' => 'global.author',
                'property' => 'username,email',
                'to_string_callback' => function ($enitity, $property) {
                    return $enitity->getEmail() . ' - ' . $enitity->getUsername();
                }
            ])
            ->add('isEnabled', null, [
                'label' => 'global.published',
                'editable' => true
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj'
            ])
            ->add('position', null, [
                'label' => 'global.position'
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                    'edit' => [],
                    'delete' => []
                ]
            ]);
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('title', null, [
                'label' => 'global.title'
            ])
            ->add('body', null, [
                'label' => 'global.description'
            ])
            ->add('Author', 'sonata_type_model', [
                'label' => 'global.author',
                'choices_as_values' => true,
                'required' => true
            ])
            ->add('link', null, [
                'label' => 'admin.fields.video.link',
                'required' => true,
                'help' => 'admin.help.project.video',
                'attr' => [
                    'placeholder' => 'http://'
                ]
            ])
            ->add('position', null, [
                'label' => 'global.position'
            ])
            ->add(
                'media',
                'sonata_type_model_list',
                [
                    'label' => 'global.image',
                    'required' => false,
                    'help' => 'admin.help.video.media'
                ],
                [
                    'link_parameters' => [
                        'context' => 'default',
                        'hide_context' => true,
                        'provider' => 'sonata.media.provider.image'
                    ]
                ]
            )
            ->add('isEnabled', null, [
                'label' => 'global.published',
                'required' => false
            ]);
    }

    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, [
                'label' => 'global.title'
            ])
            ->add('body', null, [
                'label' => 'global.description'
            ])
            ->add('Author', null, [
                'label' => 'global.author'
            ])
            ->add('media', 'sonata_media_type', [
                'template' => 'CapcoAdminBundle:Event:media_show_field.html.twig',
                'provider' => 'sonata.media.provider.image',
                'label' => 'global.image'
            ])
            ->add('isEnabled', null, [
                'label' => 'global.published',
                'editable' => true
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj'
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation'
            ]);
    }
}
