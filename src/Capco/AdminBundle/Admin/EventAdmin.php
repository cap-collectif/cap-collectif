<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Enum\ReviewStatus;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\CoreBundle\Model\Metadata;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class EventAdmin extends AbstractAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'DESC',
        '_sort_by' => 'updatedAt'
    ];

    private $indexer;
    private $token;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        Indexer $indexer,
        TokenStorageInterface $token
    ) {
        $this->indexer = $indexer;
        $this->token = $token;

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

    public function getTemplate($name)
    {
        if ('create' === $name) {
            return 'CapcoAdminBundle:Event:create.html.twig';
        }
        if ('edit' === $name) {
            return 'CapcoAdminBundle:Event:edit.html.twig';
        }

        return $this->getTemplateRegistry()->getTemplate($name);
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
            ->add(
                'status',
                'doctrine_orm_callback',
                [
                    'callback' => function ($queryBuilder, $alias, $field, $value) {
                        if (!$value['value']) {
                            return;
                        }

                        if (\in_array($value['value'], ReviewStatus::$eventReviewStatus)) {
                            $queryBuilder->leftJoin(sprintf('%s.review', $alias), 'r');
                            $queryBuilder->andWhere('r.status = :status');
                            $queryBuilder->setParameter('status', $value['value']);
                        } else {
                            $queryBuilder->andWhere(sprintf('%s.enabled  = :status', $alias));
                            $queryBuilder->setParameter(
                                'status',
                                ReviewStatus::PUBLISHED === $value['value']
                            );
                        }

                        return true;
                    },
                    'mapped' => false,
                    'label' => 'admin.fields.event.is_enabled',
                    'translation_domain' => 'CapcoAppBundle'
                ],
                'choice',
                [
                    'choices' => array_flip(ReviewStatus::$eventStatusesLabels),
                    'translation_domain' => 'CapcoAppBundle'
                ]
            )
            ->add('commentable', null, [
                'label' => 'admin.fields.event.is_commentable'
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.event.updated_at'
            ])
            ->add('startAt', 'doctrine_orm_datetime_range', [
                'label' => 'start-at'
            ])
            ->add('endAt', 'doctrine_orm_datetime_range', [
                'label' => 'end-at'
            ])
            ->add('createdAt', 'doctrine_orm_datetime_range', [
                'label' => 'creation'
            ]);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.event.title'
            ])
            ->add('startAt', null, [
                'label' => 'start-date'
            ])
            ->add('endAt', null, [
                'label' => 'end-date'
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
        /** @var User $viewer */
        $viewer = $this->token->getToken()->getUser();

        if ($viewer->isSuperAdmin()) {
            $listMapper
                ->add('newAddressIsSimilar', null, [
                    'label' => 'isSimilar'
                ])
                ->add('similarityOfNewAddress', null, [
                    'label' => 'similarityOfNewAddress'
                ]);
        }

        $listMapper
            ->add('projects', null, [
                'label' => 'admin.fields.event.projects'
            ])
            ->add('author', 'sonata_type_model', [
                'label' => 'admin.fields.event.author'
            ])
            ->add('status', null, [
                'mapped' => false,
                'label' => 'registration.type',
                'template' => 'CapcoAdminBundle:Event:status_list_field.html.twig',
                'statusLabels' => ReviewStatus::$eventStatusesLabels
            ])
            ->add('commentsCount', null, [
                'label' => 'admin.fields.event.comments_count',
                'template' => 'CapcoAdminBundle:Event:comments_list_field.html.twig'
            ])
            ->add('registrations', null, [
                'label' => 'registrations',
                'template' => 'CapcoAdminBundle:Event:registrations_list_field.html.twig'
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.event.created_at'
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.event.updated_at'
            ])
            ->add('_action', 'actions', [
                'label' => 'members',
                'actions' => [
                    'registrations' => [
                        'template' => 'CapcoAdminBundle:CRUD:list__action_registrations.html.twig'
                    ]
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
        $collection->clearExcept(['batch', 'list', 'create', 'delete', 'show', 'edit']);
    }
}
