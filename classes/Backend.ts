import { Collection } from '../types/interfaces/Collection'

export class Backend {
	private collections: Collection[] = []

	createCollection(name: string): Collection {
		if (name == null || name.length === 0) throw Error('Empty collection name')

		const newCollection = {
			name,
			id: this.collections.length,
		}

		this.collections.push(newCollection)
		return newCollection
	}

	getCollections(): Collection[] {
		return this.collections
	}

	getCollectionById(collectionId: number): Collection | undefined {
		return this.collections.find((collection) => collection.id === collectionId)
	}
}
