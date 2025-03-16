<script lang="ts">
	import type { PageProps } from './$types';
	let { form }: PageProps = $props();
</script>

<form method="POST" class="my-3" action="?/auctions">
	<label class="input">
		<span class="label">Miasto</span>
		<input type="text" name="city" />
	</label>
	<button class="btn" type="submit">Szukaj</button>
</form>

{#if form?.auctions}
	<span class="text-xl my-3">Lista ofert</span>
	<div class="overflow-x-auto">
		<table class="table-zebra table">
			<thead>
				<tr>
					<th>Data licytacji</th>
					<th>Kategoria</th>
					<th>Nazwa</th>
					<th>Miasto</th>
					<th>Cena wywołania</th>
					<th>Link do aukcji</th>
					<th>Link do szczegółów</th>
				</tr>
			</thead>
			<tbody>
				{#each form.auctions as auction}
					<tr>
						<td>{auction.startDate?.toLocaleDateString()}</td>
						<td>{auction.category}</td>
						<td>{auction.name}</td>
						<td>{auction.city}</td>
						<td>{auction.price}</td>
						<td><a href={auction.auctionUrl} target="_blank">Zobacz aukcję</a></td>
						<td><a href={auction.detailsUrl} target="_blank">Szczegóły</a></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
