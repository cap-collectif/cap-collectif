<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Toggle\Manager;
use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\ModelAutocompleteType;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\CoreBundle\Model\Metadata;
use Symfony\Component\Form\Extension\Core\Type\UrlType;

class EventAdmin extends AbstractAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'DESC',
        '_sort_by' => 'updatedAt'
    ];

    private $indexer;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        Indexer $indexer
    ) {
        $this->indexer = $indexer;
        parent::__construct($code, $class, $baseControllerName);
    }

    public function getFeatures()
    {
        return ['calendar'];
    }

    public function preRemove($object)
    {
        $this->indexer->remove(\get_class($object), $object->getId());
        $this->indexer->finishBulk();
        parent::preRemove($object);
    }

    public function preUpdate($object)
    {
        $this->indexer->index(\get_class($object), $object->getId());
        $this->indexer->finishBulk();
        parent::preUpdate($object);
    }

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

            return new Metadata($object->getTitle(), $object->getBody(), $url);
        }

        return parent::getObjectMetadata($object);
    }

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper->add('title', null, [
            'label' => 'admin.fields.event.title'
        ]);
        if (
            $this->getConfigurationPool()
                ->getContainer()
                ->get(Manager::class)
                ->isActive('themes')
        ) {
            $datagridMapper->add('themes', null, [
                'label' => 'admin.fields.event.themes'
            ]);
        }

        $datagridMapper
            ->add('projects', null, [
                'label' => 'admin.fields.event.projects'
            ])
            ->add(
                'author',
                'doctrine_orm_model_autocomplete',
                [
                    'label' => 'admin.fields.event.author'
                ],
                null,
                [
                    'property' => 'email,username',
                    'to_string_callback' => function ($entity, $property) {
                        return $entity->getEmail() . ' - ' . $entity->getUsername();
                    }
                ]
            )
            ->add('enabled', null, [
                'label' => 'admin.fields.event.is_enabled'
            ])
            ->add('commentable', null, [
                'label' => 'admin.fields.event.is_commentable'
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.event.updated_at'
            ])
            ->add('startAt', 'doctrine_orm_datetime_range', [
                'label' => 'admin.fields.event.start_at'
            ])
            ->add('endAt', 'doctrine_orm_datetime_range', [
                'label' => 'admin.fields.event.end_at'
            ]);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.event.title'
            ])
            ->add('startAt', null, [
                'label' => 'admin.fields.event.start_at'
            ])
            ->add('endAt', null, [
                'label' => 'admin.fields.event.end_at'
            ]);
        if (
            $this->getConfigurationPool()
                ->getContainer()
                ->get(Manager::class)
                ->isActive('themes')
        ) {
            $listMapper->add('themes', null, [
                'label' => 'admin.fields.event.themes'
            ]);
        }

        $listMapper
            ->add('projects', null, [
                'label' => 'admin.fields.event.projects'
            ])
            ->add('author', 'sonata_type_model', [
                'label' => 'admin.fields.event.author'
            ])
            ->add('enabled', null, [
                'label' => 'admin.fields.event.is_enabled',
                'editable' => true
            ])
            ->add('commentable', null, [
                'label' => 'admin.fields.event.is_commentable',
                'editable' => true
            ])
            ->add('commentsCount', null, [
                'label' => 'admin.fields.event.comments_count'
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.event.updated_at'
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'registrations' => [
                        'template' => 'CapcoAdminBundle:CRUD:list__action_registrations.html.twig'
                    ],
                    'delete' => [
                        'template' => 'CapcoAdminBundle:CRUD:list__action_delete.html.twig'
                    ]
                ]
            ]);
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        // define group zoning
        $formMapper
            ->with('admin.fields.event.group_event', ['class' => 'col-md-12'])
            ->end()
            ->with('admin.fields.event.group_meta', ['class' => 'col-md-6'])
            ->end()
            ->with('admin.fields.event.group_address', ['class' => 'col-md-6'])
            ->end()
            ->end();
        $formMapper
            ->with('admin.fields.event.group_event')
            ->add('title', null, [
                'label' => 'admin.fields.event.title'
            ])
            ->add('body', CKEditorType::class, [
                'label' => 'admin.fields.event.body',
                'config_name' => 'admin_editor'
            ])
            ->add('author', ModelAutocompleteType::class, [
                'label' => 'admin.fields.event.author',
                'required' => true,
                'property' => 'username,email',
                'to_string_callback' => function ($entity, $property) {
                    return $entity->getEmail() . ' - ' . $entity->getUsername();
                }
            ])
            ->add('startAt', 'sonata_type_datetime_picker', [
                'label' => 'admin.fields.event.start_at',
                'format' => 'dd/MM/yyyy HH:mm',
                'attr' => [
                    'data-date-format' => 'DD/MM/YYYY HH:mm'
                ]
            ])
            ->add('endAt', 'sonata_type_datetime_picker', [
                'label' => 'admin.fields.event.end_at',
                'format' => 'dd/MM/yyyy HH:mm',
                'attr' => [
                    'data-date-format' => 'DD/MM/YYYY HH:mm'
                ],
                'help' => 'admin.help.event.endAt',
                'required' => false
            ])
            ->end()
            ->with('admin.fields.event.group_meta')
            ->add('guestListEnabled', null, [
                'label' => 'admin.fields.event.registration_enable',
                'required' => false
            ])
            ->add('link', UrlType::class, [
                'label' => 'admin.fields.event.link',
                'required' => false,
                'attr' => [
                    'placeholder' => 'http://'
                ]
            ])
            ->add(
                'media',
                'sonata_type_model_list',
                [
                    'label' => 'admin.fields.event.media',
                    'required' => false
                ],
                [
                    'link_parameters' => [
                        'context' => 'default',
                        'hide_context' => true,
                        'provider' => 'sonata.media.provider.image'
                    ]
                ]
            )
            ->end();

        if (
            $this->getConfigurationPool()
                ->getContainer()
                ->get(Manager::class)
                ->isActive('themes')
        ) {
            $formMapper->add('themes', 'sonata_type_model', [
                'label' => 'admin.fields.event.themes',
                'required' => false,
                'multiple' => true,
                'by_reference' => false,
                'choices_as_values' => true
            ]);
        }

        $formMapper
            ->add('projects', 'sonata_type_model', [
                'label' => 'admin.fields.event.projects',
                'required' => false,
                'multiple' => true,
                'by_reference' => false,
                'choices_as_values' => true
            ])
            ->add('enabled', null, [
                'label' => 'admin.fields.event.is_enabled',
                'required' => false
            ])
            ->add('commentable', null, [
                'label' => 'admin.fields.event.is_commentable',
                'required' => false
            ])
            ->end()
            ->with('admin.fields.event.group_address')
            ->add('address', null, [
                'label' => 'admin.fields.event.address',
                'required' => false,
                'help' => 'admin.help.event.adress'
            ])
            ->add('zipCode', null, [
                'label' => 'admin.fields.event.zipcode',
                'required' => false
            ])
            ->add('city', null, [
                'label' => 'admin.fields.event.city',
                'required' => false
            ])
            ->add('country', null, [
                'label' => 'admin.fields.event.country',
                'required' => false
            ])
            ->end();
        $formMapper
            ->with('admin.fields.page.advanced')
            ->add('metaDescription', null, [
                'label' => 'event.metadescription',
                'required' => false,
                'help' => 'admin.help.metadescription'
            ])
            ->add('customCode', null, [
                'label' => 'admin.customcode',
                'required' => false,
                'help' => 'admin.help.customcode',
                'attr' => [
                    'rows' => 10,
                    'placeholder' => '<script type="text/javascript"> </script>'
                ]
            ]);
    }

    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, [
                'label' => 'admin.fields.event.title'
            ])
            ->add('body', null, [
                'label' => 'admin.fields.event.body'
            ])
            ->add('startAt', null, [
                'label' => 'admin.fields.event.start_at'
            ])
            ->add('endAt', null, [
                'label' => 'admin.fields.event.end_at'
            ]);
        if (
            $this->getConfigurationPool()
                ->getContainer()
                ->get(Manager::class)
                ->isActive('themes')
        ) {
            $showMapper->add('themes', null, [
                'label' => 'admin.fields.event.themes'
            ]);
        }

        $showMapper
            ->add('project', null, [
                'label' => 'admin.fields.event.project'
            ])
            ->add('author', null, [
                'label' => 'admin.fields.event.author'
            ])
            ->add('media', 'sonata_media_type', [
                'template' => 'CapcoAdminBundle:Event:media_show_field.html.twig',
                'provider' => 'sonata.media.provider.image',
                'label' => 'admin.fields.event.media'
            ])
            ->add('enabled', null, [
                'label' => 'admin.fields.event.is_enabled'
            ])
            ->add('commentable', null, [
                'label' => 'admin.fields.event.is_commentable'
            ])
            ->add('commentsCount', null, [
                'label' => 'admin.fields.event.comments_count'
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.event.updated_at'
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.event.created_at'
            ])
            ->add('address', null, [
                'label' => 'admin.fields.event.address'
            ])
            ->add('zipCode', 'number', [
                'label' => 'admin.fields.event.zipcode'
            ])
            ->add('city', null, [
                'label' => 'admin.fields.event.city'
            ])
            ->add('country', null, [
                'label' => 'admin.fields.event.country'
            ])
            ->add('lat', null, [
                'label' => 'admin.fields.event.lat'
            ])
            ->add('lng', null, [
                'label' => 'admin.fields.event.lng'
            ]);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['batch', 'list', 'create', 'edit', 'delete', 'show']);
    }
}
